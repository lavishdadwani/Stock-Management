import {mongoose} from 'mongoose';
import StockTransfer from '../models/stockTransfer.model.js';
import Stock from '../models/stock.model.js';
import User from '../models/user.model.js';
import { validateStockTransferData } from '../utils/validation.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

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

    if (toUser.role !== 'core team') {
      return res.error(
        'Invalid recipient',
        null,
        'Stock can only be transferred to core team members',
        400
      );
    }

    const quantityInKg = convertToKg(quantity, unit);

    // if stock is available, then transfer the stock
    const stockAggregation = await Stock.aggregate([
      {
        $match: {
          itemName: itemName
        }
      },
      {
        $group: {
          _id: '$itemName',
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    const availableStock = stockAggregation.length > 0 ? stockAggregation[0].totalQuantity : 0;

    if (availableStock < quantityInKg) {
      return res.error(
        'Insufficient stock',
        {
          required: quantityInKg,
          available: availableStock,
          itemName: itemName
        },
        `Insufficient ${itemName} available. Required: ${quantityInKg} kg, Available: ${availableStock} kg`,
        400
      );
    }

    const stockTransfer = new StockTransfer({
      fromUserId,
      toUserId,
      itemName,
      quantity: quantityInKg,
      unit: 'kg',
      transferDate: new Date(),
      description: description || null,
      status: 'completed'
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
    await stockEntry.save();
    
    // Link stock entry to transfer
    stockTransfer.stockEntryId = stockEntry._id;
    await stockTransfer.save();

    await stockTransfer.populate([
      { path: 'fromUserId', select: 'name email role' },
      { path: 'toUserId', select: 'name email role' }
    ]);

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

// Get stock transfers for a specific core team member
export const getMyStockTransfers = async (req, res) => {
  try {
    const userId = req.userId;
    const { page, limit, itemName, startDate, endDate } = req.query;
    
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });
    
    const query = { toUserId: userId };
    
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

    const stockTransfers = await StockTransfer.find(query)
      .populate('fromUserId', 'name email role')
      .populate('toUserId', 'name email role')
      .sort({ transferDate: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = stockTransfers.length;
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

      // If quantity increased or itemName changed, check availability
      if (quantityDifference > 0 || newItemName !== existingTransfer.itemName) {
        const stockAggregation = await Stock.aggregate([
          {
            $match: {
              itemName: newItemName
            }
          },
          {
            $group: {
              _id: '$itemName',
              totalQuantity: { $sum: '$quantity' }
            }
          }
        ]);

        const availableStock = stockAggregation.length > 0 ? stockAggregation[0].totalQuantity : 0;

        if (availableStock < quantityDifference) {
          return res.error(
            'Insufficient stock',
            {
              required: quantityDifference,
              available: availableStock,
              itemName: newItemName
            },
            `Insufficient ${newItemName} available. Required: ${quantityDifference} kg, Available: ${availableStock} kg`,
            400
          );
        }
      }

      // Get the linked stock entry and update it directly
      const stockEntry = await Stock.findById(existingTransfer.stockEntryId);
      
      if (!stockEntry) {
        return res.error(
          'Stock entry not found',
          null,
          'The associated stock entry for this transfer was not found',
          404
        );
      }
      
      stockEntry.itemName = newItemName;
      stockEntry.quantity = -newQuantityInKg; // always keep it negative to add back the stock
      stockEntry.description = `Updated transfer #${existingTransfer._id} - ${itemNameChanged ? `Item changed to ${newItemName}, ` : ''}Quantity changed from ${oldQuantityInKg}kg to ${newQuantityInKg}kg`;
      await stockEntry.save();
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

      if (toUser.role !== 'core team') {
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
    }

    await StockTransfer.findByIdAndDelete(id);

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
    const { toUserId } = req.query;

    const pipeline = [];

    // if (toUserId) {
      pipeline.push({
        $match: {
          toUserId: userRole == "core team" ? userId : new mongoose.Types.ObjectId(toUserId)
        }
      });
    // }

    pipeline.push({
      $group: {
        _id: '$itemName',
        totalQuantity: { $sum: '$quantity' }
      }
    });

    const quantities = await StockTransfer.aggregate(pipeline);

    let aluminium = 0;
    let copper = 0;
    let scrap = 0;

    quantities.forEach((item) => {
      const quantity = Math.round(item.totalQuantity * 100) / 100;
      if (item._id === 'Aluminium') {
        aluminium = quantity;
      } else if (item._id === 'Copper') {
        copper = quantity;
      } else if (item._id === 'Scrap') {
        scrap = quantity;
      }
    });

    res.success(
      'Stock transfer quantities fetched successfully',
      {
        aluminium: {
          name: 'Aluminium',
          quantity: aluminium,
          unit: 'kg'
        },
        copper: {
          name: 'Copper',
          quantity: copper,
          unit: 'kg'
        },
        scrap: {
          name: 'Scrap',
          quantity: scrap,
          unit: 'kg'
        }
      },
      null,
      200
    );
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch stock transfer quantities',
      error,
      'An error occurred while fetching stock transfer quantities',
      500
    );
  }
};

