import {mongoose} from 'mongoose';
import StockTransfer from '../models/stockTransfer.model.js';
import Stock from '../models/stock.model.js';
import User from '../models/user.model.js';
import { validateStockTransferData } from '../utils/validation.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';
import { evaluateStockLevel } from '../utils/stockAlerts.js';
import withStockLock from '../utils/withStockLock.js';
import { logActivity } from '../utils/auditLog.js';
import { toCsv, sendCsv } from '../utils/csv.js';

const EXPORT_ROW_LIMIT = 10000;

// Helper function to convert quantity to KG
const convertToKg = (quantity, unit) => {
  const qty = parseFloat(quantity) || 0;
  const unitLower = (unit || 'kg').toLowerCase();
  
  if (unitLower === 'g') {
    return qty / 1000;
  } else if (unitLower === 'ton') {
    return qty * 1000;
  }
  return qty;
};

// Transfer stock to core team member API
export const transferStock = async (req, res) => {
  try {
    const fromUserId = req.userId; 
    const {
      toUserId,
      itemName,
      quantity,
      unit,
      description
    } = req.body;

    const validation = validateStockTransferData(req.body);
    if (!validation.isValid) {
      return res.error(
        'Validation failed',
        validation.errors,
        Object.values(validation.errors)[0],
        400
      );
    }

    const fromUser = await User.findById(fromUserId);
    if (!fromUser || (fromUser.role !== 'manager' && fromUser.role !== 'owner')) {
      return res.error(
        'Unauthorized',
        null,
        'Only managers and owners can transfer stock',
        403
      );
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.error(
        'User not found',
        null,
        'The specified user does not exist',
        404
      );
    }

    if (toUser.role !== 'core_team') {
      return res.error(
        'Invalid recipient',
        null,
        'Stock can only be transferred to core team members',
        400
      );
    }

    const quantityInKg = convertToKg(quantity, unit);

    // Availability check + deduction run inside a per-material transaction so
    // two concurrent transfers of the same material can't both pass the
    // check against a stale total (see utils/withStockLock.js).
    const result = await withStockLock(itemName, async (session) => {
      const stockAggregation = await Stock.aggregate([
        { $match: { itemName } },
        { $group: { _id: '$itemName', totalQuantity: { $sum: '$quantity' } } }
      ]).session(session);

      const availableStock = stockAggregation.length > 0 ? stockAggregation[0].totalQuantity : 0;

      if (availableStock < quantityInKg) {
        return { insufficientStock: true, availableStock };
      }

      const stockTransfer = new StockTransfer({
        fromUserId,
        toUserId,
        itemName,
        quantity: quantityInKg,
        unit: 'kg',
        transferDate: new Date(),
        description: description || null,
        status: 'completed',
        entryType: 'transfer_in'
      });

      // Deduct stock from inventory by creating a negative stock entry
      const stockEntry = new Stock({
        itemName,
        quantity: -quantityInKg,
        unit: 'kg',
        stockType: 'raw',
        category: 'wire',
        addedBy: fromUserId,
        description: `Transferred to ${toUser.name} (${toUser.email}) - ${description || 'Stock transfer'}`
      });

      // Save stock entry first to get its ID
      await stockEntry.save({ session });

      // Link stock entry to transfer
      stockTransfer.stockEntryId = stockEntry._id;
      await stockTransfer.save({ session });

      return { stockTransfer };
    });

    if (result.insufficientStock) {
      return res.error(
        'Insufficient stock',
        {
          required: quantityInKg,
          available: result.availableStock,
          itemName: itemName
        },
        `Insufficient ${itemName} available. Required: ${quantityInKg} kg, Available: ${result.availableStock} kg`,
        400
      );
    }

    await evaluateStockLevel(itemName);

    const { stockTransfer } = result;
    await stockTransfer.populate([
      { path: 'fromUserId', select: 'name email role' },
      { path: 'toUserId', select: 'name email role' }
    ]);

    await logActivity({
      entityType: 'stockTransfer',
      entityId: stockTransfer._id,
      action: 'create',
      performedBy: fromUserId,
      description: `Transferred ${quantityInKg}kg of ${itemName} to ${toUser.name}`,
      after: stockTransfer.toObject()
    });

    res.success(
      'Stock transferred successfully',
      stockTransfer,
      `Stock transferred successfully to ${toUser.name}`,
      201
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to transfer stock',
      error,
      'An error occurred while transferring stock',
      500
    );
  }
};

// Get all stock transfers with pagination API
export const getAllStockTransfers = async (req, res) => {
  try {
    const { fromUserId, toUserId, itemName, page, limit, startDate, endDate } = req.query;
    
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });
    
    const query = {};
    
    if (fromUserId) {
      query.fromUserId = fromUserId;
    }
    
    if (toUserId) {
      query.toUserId = toUserId;
    }
    
    if (itemName) {
      query.itemName = itemName;
    }
    
    if (startDate || endDate) {
      query.transferDate = {};
      if (startDate) {
        query.transferDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.transferDate.$lte = new Date(endDate);
      }
    }

    // Get total count for pagination
    const total = await StockTransfer.countDocuments(query);

    // Get paginated stock transfers
    const stockTransfers = await StockTransfer.find(query)
      .populate('fromUserId', 'name email role')
      .populate('toUserId', 'name email role')
      .sort({ transferDate: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const paginatedData = formatPaginatedResponse(stockTransfers, total, pageNum, limitNum);
    
    res.success(
      'Stock transfers fetched successfully',
      paginatedData.data,
      null,
      200,
      paginatedData.pagination
    );
  } catch (error) {
    console.error('Error fetching stock transfers:', error);
    res.error(
      error.message || 'Failed to fetch stock transfers',
      error,
      'An error occurred while fetching stock transfers',
      500
    );
  }
};

// Export stock transfers as CSV
export const exportStockTransfersCsv = async (req, res) => {
  try {
    const { fromUserId, toUserId, itemName, startDate, endDate } = req.query;

    const query = {};
    if (fromUserId) query.fromUserId = fromUserId;
    if (toUserId) query.toUserId = toUserId;
    if (itemName) query.itemName = itemName;
    if (startDate || endDate) {
      query.transferDate = {};
      if (startDate) query.transferDate.$gte = new Date(startDate);
      if (endDate) query.transferDate.$lte = new Date(endDate);
    }

    const transfers = await StockTransfer.find(query)
      .populate('fromUserId', 'name email')
      .populate('toUserId', 'name email')
      .sort({ transferDate: -1 })
      .limit(EXPORT_ROW_LIMIT);

    const csv = toCsv(transfers, [
      { header: 'Item', value: (r) => r.itemName },
      { header: 'Quantity (kg)', value: (r) => r.quantity },
      { header: 'From', value: (r) => r.fromUserId?.name || '' },
      { header: 'To', value: (r) => r.toUserId?.name || '' },
      { header: 'Status', value: (r) => r.status },
      { header: 'Transfer Date', value: (r) => r.transferDate?.toISOString() || '' },
      { header: 'Description', value: (r) => r.description || '' }
    ]);

    sendCsv(res, `stock-transfers-export-${Date.now()}.csv`, csv);
  } catch (error) {
    console.error('Error exporting stock transfers CSV:', error);
    res.error(
      error.message || 'Failed to export stock transfers',
      error,
      'An error occurred while exporting stock transfers',
      500
    );
  }
};

// Get stock transfers for a specific core team member
export const getMyStockTransfers = async (req, res) => {
  try {
    const userId = req.userId;
    const { page, limit, itemName, startDate, endDate, month, year } = req.query;
    
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });
    
    const query = { toUserId: userId };
    
    if (itemName) {
      query.itemName = itemName;
    }
    
    const hasMonth = month !== undefined && month !== null && month !== '';
    const hasYear = year !== undefined && year !== null && year !== '';
    if (hasMonth || hasYear || startDate || endDate) {
      query.transferDate = {};
      if (hasMonth) {
        const m = Number(month);
        const y = hasYear ? Number(year) : new Date().getFullYear();
        if (!m || m < 1 || m > 12 || !y) {
          return res.error('Invalid month/year', null, 'Month must be 1-12 and year must be valid', 400);
        }
        const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        query.transferDate.$gte = start;
        query.transferDate.$lte = end;
      } else {
        if (startDate) query.transferDate.$gte = new Date(startDate);
        if (endDate) query.transferDate.$lte = new Date(endDate);
      }
    }

    const total = await StockTransfer.countDocuments(query);

    const stockTransfers = await StockTransfer.find(query)
      .populate('fromUserId', 'name email role')
      .populate('toUserId', 'name email role')
      .sort({ transferDate: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const paginatedData = formatPaginatedResponse(stockTransfers, total, pageNum, limitNum);
    
    res.success(
      'Stock transfers fetched successfully',
      paginatedData.data,
      null,
      200,
      paginatedData.pagination
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch stock transfers',
      error,
      'An error occurred while fetching stock transfers',
      500
    );
  }
};

// Get stock transfer by ID
export const getStockTransferById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stockTransfer = await StockTransfer.findById(id)
      .populate('fromUserId', 'name email role')
      .populate('toUserId', 'name email role');
    
    if (!stockTransfer) {
      return res.error(
        'Stock transfer not found',
        null,
        'The requested stock transfer does not exist',
        404
      );
    }

    res.success(
      'Stock transfer fetched successfully',
      stockTransfer,
      null,
      200
    );
  } catch (error) {
    console.error('Error fetching stock transfer:', error);
    res.error(
      error.message || 'Failed to fetch stock transfer',
      error,
      'An error occurred while fetching the stock transfer',
      500
    );
  }
};

// Update stock transfer
export const updateStockTransfer = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { toUserId, itemName, quantity, unit, description } = req.body;

    const existingTransfer = await StockTransfer.findById(id);
    
    if (!existingTransfer) {
      return res.error(
        'Stock transfer not found',
        null,
        'The requested stock transfer does not exist',
        404
      );
    }

    const before = existingTransfer.toObject();

    // Verify that user is a manager or owner
    const user = await User.findById(userId);
    if (!user || (user.role !== 'manager' && user.role !== 'owner')) {
      return res.error(
        'Unauthorized',
        null,
        'Only managers and owners can update stock transfers',
        403
      );
    }

    const finalData = {
      toUserId: toUserId !== undefined ? toUserId : existingTransfer.toUserId.toString(),
      itemName: itemName !== undefined ? itemName : existingTransfer.itemName,
      quantity: quantity !== undefined ? quantity : existingTransfer.quantity,
      unit: unit !== undefined ? unit : existingTransfer.unit,
      description: description !== undefined ? description : existingTransfer.description
    };

    const validation = validateStockTransferData(finalData);
    if (!validation.isValid) {
      return res.error(
        'Validation failed',
        validation.errors,
        Object.values(validation.errors)[0],
        400
      );
    }

    // Check what actually changed (needed for stock availability check)
    const quantityChanged =  parseFloat(quantity) !== existingTransfer.quantity;
    const itemNameChanged =  itemName !== existingTransfer.itemName;
    const toUserIdChanged =  toUserId !== existingTransfer.toUserId.toString();
    const unitChanged =  unit !== existingTransfer.unit;

    // Convert to use final validated data
    const newQuantity = finalData.quantity;
    const newUnit = finalData.unit;
    const newItemName = finalData.itemName;
    const newQuantityInKg = convertToKg(newQuantity, newUnit);
    const oldQuantityInKg = existingTransfer.quantity;

    // If quantity or itemName changed, we need to check stock availability
    const needsStockCheck = quantityChanged || itemNameChanged || unitChanged;

    if (needsStockCheck) {

      // Calculate the difference
      const quantityDifference = newQuantityInKg - oldQuantityInKg;
      const needsAvailabilityCheck = quantityDifference > 0 || newItemName !== existingTransfer.itemName;

      // Availability check + stock entry update run inside a per-material
      // transaction, same as transferStock, to avoid racing concurrent edits.
      const lockResult = await withStockLock(newItemName, async (session) => {
        if (needsAvailabilityCheck) {
          const stockAggregation = await Stock.aggregate([
            { $match: { itemName: newItemName } },
            { $group: { _id: '$itemName', totalQuantity: { $sum: '$quantity' } } }
          ]).session(session);

          const availableStock = stockAggregation.length > 0 ? stockAggregation[0].totalQuantity : 0;

          if (availableStock < quantityDifference) {
            return { insufficientStock: true, availableStock };
          }
        }

        // Get the linked stock entry and update it directly
        const stockEntry = await Stock.findById(existingTransfer.stockEntryId).session(session);

        if (!stockEntry) {
          return { notFound: true };
        }

        const previousItemName = existingTransfer.itemName;

        stockEntry.itemName = newItemName;
        stockEntry.quantity = -newQuantityInKg; // always keep it negative to add back the stock
        stockEntry.description = `Updated transfer #${existingTransfer._id} - ${itemNameChanged ? `Item changed to ${newItemName}, ` : ''}Quantity changed from ${oldQuantityInKg}kg to ${newQuantityInKg}kg`;
        await stockEntry.save({ session });

        return { previousItemName };
      });

      if (lockResult.insufficientStock) {
        return res.error(
          'Insufficient stock',
          {
            required: quantityDifference,
            available: lockResult.availableStock,
            itemName: newItemName
          },
          `Insufficient ${newItemName} available. Required: ${quantityDifference} kg, Available: ${lockResult.availableStock} kg`,
          400
        );
      }

      if (lockResult.notFound) {
        return res.error(
          'Stock entry not found',
          null,
          'The associated stock entry for this transfer was not found',
          404
        );
      }

      await evaluateStockLevel(newItemName);
      if (itemNameChanged) {
        await evaluateStockLevel(lockResult.previousItemName);
      }
    }

    // Verify toUserId 
    if (toUserIdChanged) {
      const toUser = await User.findById(finalData.toUserId);
      if (!toUser) {
        return res.error(
          'User not found',
          null,
          'The specified recipient user does not exist',
          404
        );
      }

      if (toUser.role !== 'core_team') {
        return res.error(
          'Invalid recipient',
          null,
          'Stock can only be transferred to core team members',
          400
        );
      }
    }
      existingTransfer.quantity = newQuantityInKg;
    //   existingTransfer.unit = 'kg';
      existingTransfer.itemName = finalData.itemName;
      existingTransfer.toUserId = finalData.toUserId;
      existingTransfer.description = finalData.description;

    await existingTransfer.save();

    await logActivity({
      entityType: 'stockTransfer',
      entityId: existingTransfer._id,
      action: 'update',
      performedBy: userId,
      description: `Updated stock transfer #${existingTransfer._id}`,
      before,
      after: existingTransfer.toObject()
    });

    res.success(
      'Stock transfer updated successfully',
      existingTransfer,
      'Stock transfer has been updated successfully',
      200
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to update stock transfer',
      error,
      'An error occurred while updating the stock transfer',
      500
    );
  }
};

// Delete stock transfer
export const deleteStockTransfer = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const existingTransfer = await StockTransfer.findById(id);
    
    if (!existingTransfer) {
      return res.error(
        'Stock transfer not found',
        null,
        'The requested stock transfer does not exist',
        404
      );
    }

    const user = await User.findById(userId);
    if (!user || (user.role !== 'manager' && user.role !== 'owner')) {
      return res.error(
        'Unauthorized',
        null,
        'Only managers and owners can delete stock transfers',
        403
      );
    }

    // Get the linked stock entry and delete it directly
    if (existingTransfer.stockEntryId) {
      await Stock.findByIdAndDelete(existingTransfer.stockEntryId);
      await evaluateStockLevel(existingTransfer.itemName);
    }

    await StockTransfer.findByIdAndDelete(id);

    await logActivity({
      entityType: 'stockTransfer',
      entityId: existingTransfer._id,
      action: 'delete',
      performedBy: userId,
      description: `Deleted stock transfer #${existingTransfer._id}`,
      before: existingTransfer.toObject()
    });

    res.success(
      'Stock transfer deleted successfully',
      existingTransfer,
      'Stock transfer has been deleted and stock has been added back to inventory',
      200
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to delete stock transfer',
      error,
      'An error occurred while deleting the stock transfer',
      500
    );
  }
};

// Get stock transfer quantities (Aluminium, Copper, Scrap) in KG
export const getStockTransferQuantities = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;
    const { toUserId, wire, startDate, endDate, month, year } = req.query;

    const pipeline = [];

    // 🔥 BUILD MATCH OBJECT
    const match = {};

    // 👇 USER FILTER
    if (toUserId) {
      match.toUserId = new mongoose.Types.ObjectId(toUserId);
    } else if (userRole === "core_team") {
      match.toUserId = new mongoose.Types.ObjectId(userId);
    }

    // 👇 DATE FILTER
    const hasMonth = month !== undefined && month !== null && month !== "";
    const hasYear = year !== undefined && year !== null && year !== "";

    if (hasMonth) {
      const m = Number(month);
      const y = hasYear ? Number(year) : new Date().getFullYear();

      if (!m || m < 1 || m > 12 || !y) {
        return res.error(
          "Invalid month/year",
          null,
          "Month must be 1-12 and year must be valid",
          400
        );
      }

      match.transferDate = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    } else {
      if (startDate || endDate) {
        match.transferDate = {};
        if (startDate) match.transferDate.$gte = new Date(startDate);
        if (endDate) match.transferDate.$lte = new Date(endDate);
      }
    }

    // 👇 WIRE FILTER
    if (wire) {
      const wireNormalized = String(wire).trim().toLowerCase();

      if (["aluminium", "copper", "scrap"].includes(wireNormalized)) {
        match.itemName = wireNormalized;
      }
    }

    // 🔥 PUSH MATCH ONCE
    pipeline.push({ $match: match });

    // 🔥 GROUP
    pipeline.push({
      $group: {
        _id: null,
        aluminium: {
          $sum: {
            $cond: [{ $eq: ["$itemName", "aluminium"] }, "$quantity", 0],
          },
        },
        copper: {
          $sum: {
            $cond: [{ $eq: ["$itemName", "copper"] }, "$quantity", 0],
          },
        },
        scrap: {
          $sum: {
            $cond: [{ $eq: ["$itemName", "scrap"] }, "$quantity", 0],
          },
        },
      },
    });

    // 🔥 ROUND
    pipeline.push({
      $project: {
        aluminium: { $round: ["$aluminium", 2] },
        copper: { $round: ["$copper", 2] },
        scrap: { $round: ["$scrap", 2] },
      },
    });

    const [doc] = await StockTransfer.aggregate(pipeline);

    const aluminium = doc?.aluminium ?? 0;
    const copper = doc?.copper ?? 0;
    const scrap = doc?.scrap ?? 0;

    return res.success(
      "Stock transfer quantities fetched successfully",
      {
        aluminium: { name: "aluminium", quantity: aluminium, unit: "kg" },
        copper: { name: "copper", quantity: copper, unit: "kg" },
        scrap: { name: "scrap", quantity: scrap, unit: "kg" },
      }
    );
  } catch (error) {
    return res.error(
      error.message || "Failed to fetch stock transfer quantities",
      error,
      "An error occurred while fetching stock transfer quantities",
      500
    );
  }
};

