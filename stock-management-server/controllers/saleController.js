import { mongoose } from 'mongoose';
import Sale from '../models/sale.model.js';
import Customer from '../models/customer.model.js';
import ItemProduced from '../models/itemProduced.model.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

const getAvailableQuantityByItem = async (itemName, excludeSaleId = null) => {
  const producedAgg = await ItemProduced.aggregate([
    { $match: { itemName, unit: 'pieces' } },
    { $group: { _id: '$itemName', totalProduced: { $sum: '$quantity' } } }
  ]);

  const soldMatch = {
    itemName,
    unit: 'pieces',
    status: 'completed'
  };

  if (excludeSaleId) {
    soldMatch._id = { $ne: new mongoose.Types.ObjectId(excludeSaleId) };
  }

  const soldAgg = await Sale.aggregate([
    { $match: soldMatch },
    { $group: { _id: '$itemName', totalSold: { $sum: '$quantity' } } }
  ]);

  const totalProduced = producedAgg[0]?.totalProduced || 0;
  const totalSold = soldAgg[0]?.totalSold || 0;
  return Math.max(0, totalProduced - totalSold);
};

export const getAvailableSaleItems = async (req, res) => {
  try {
    const produced = await ItemProduced.aggregate([
      { $match: { unit: 'pieces' } },
      { $group: { _id: '$itemName', totalProduced: { $sum: '$quantity' } } }
    ]);

    const sold = await Sale.aggregate([
      { $match: { unit: 'pieces', status: 'completed' } },
      { $group: { _id: '$itemName', totalSold: { $sum: '$quantity' } } }
    ]);

    const soldMap = new Map(sold.map((x) => [x._id, x.totalSold || 0]));
    const availableItems = produced
      .map((x) => ({
        itemName: x._id,
        availableQuantity: Math.max(0, (x.totalProduced || 0) - (soldMap.get(x._id) || 0)),
        unit: 'pieces'
      }))
      .filter((x) => x.availableQuantity > 0);

    res.success('Available sale items fetched successfully', availableItems, null, 200);
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch available sale items',
      error,
      'An error occurred while fetching available sale items',
      500
    );
  }
};

export const createSale = async (req, res) => {
  try {
    const { customerId, itemName, quantity, pricePerPiece, saleDate, notes } = req.body;
    const soldBy = req.userId;

    if (!customerId || !itemName || quantity === undefined || quantity === null) {
      return res.error(
        'Missing required fields',
        null,
        'Please provide customerId, itemName and quantity',
        400
      );
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.error('Invalid quantity', null, 'Quantity must be greater than 0', 400);
    }

    const customer = await Customer.findById(customerId);
    if (!customer || !customer.isActive) {
      return res.error('Invalid customer', null, 'Customer not found or inactive', 400);
    }

    const availableQty = await getAvailableQuantityByItem(itemName);
    if (qty > availableQty) {
      return res.error(
        'Insufficient finished stock',
        { itemName, required: qty, available: availableQty },
        `Only ${availableQty} pieces available for ${itemName}`,
        400
      );
    }

    const ppp = pricePerPiece !== undefined && pricePerPiece !== null && pricePerPiece !== ''
      ? Number(pricePerPiece)
      : null;
    const totalAmount = ppp !== null ? Number((ppp * qty).toFixed(2)) : null;

    const sale = await Sale.create({
      customerId,
      itemName: String(itemName).trim(),
      quantity: qty,
      unit: 'pieces',
      pricePerPiece: ppp,
      totalAmount,
      saleDate: saleDate ? new Date(saleDate) : new Date(),
      notes: notes ? String(notes).trim() : null,
      soldBy,
      status: 'completed'
    });

    const populated = await Sale.findById(sale._id)
      .populate('customerId', 'name companyName phone')
      .populate('soldBy', 'name email role');

    res.success('Sale created successfully', populated, 'Sale recorded successfully', 201);
  } catch (error) {
    res.error(
      error.message || 'Failed to create sale',
      error,
      'An error occurred while creating sale',
      500
    );
  }
};

export const getAllSales = async (req, res) => {
  try {
    const { page, limit, search, customerId, itemName, startDate, endDate } = req.query;
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });

    const query = { status: 'completed' };

    if (customerId) query.customerId = customerId;
    if (itemName) query.itemName = itemName;
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    if (search) {
      const customerMatch = await Customer.find(
        { name: { $regex: search, $options: 'i' } },
        { _id: 1 }
      );
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { customerId: { $in: customerMatch.map((x) => x._id) } }
      ];
    }

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('customerId', 'name companyName phone')
      .populate('soldBy', 'name email role')
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limitNum);

    const paginated = formatPaginatedResponse(sales, total, pageNum, limitNum);
    res.success('Sales fetched successfully', paginated.data, null, 200, paginated.pagination);
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch sales',
      error,
      'An error occurred while fetching sales',
      500
    );
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id)
      .populate('customerId', 'name companyName phone')
      .populate('soldBy', 'name email role');

    if (!sale) {
      return res.error('Sale not found', null, 'The requested sale does not exist', 404);
    }

    res.success('Sale fetched successfully', sale, null, 200);
  } catch (error) {
    res.error(
      error.message || 'Failed to fetch sale',
      error,
      'An error occurred while fetching sale',
      500
    );
  }
};

export const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerId, itemName, quantity, pricePerPiece, saleDate, notes } = req.body;

    const existing = await Sale.findById(id);
    if (!existing) {
      return res.error('Sale not found', null, 'The requested sale does not exist', 404);
    }

    const nextItemName = itemName ? String(itemName).trim() : existing.itemName;
    const nextQty = quantity !== undefined && quantity !== null ? Number(quantity) : existing.quantity;
    const nextCustomerId = customerId || existing.customerId;

    if (!nextQty || nextQty <= 0) {
      return res.error('Invalid quantity', null, 'Quantity must be greater than 0', 400);
    }

    const customer = await Customer.findById(nextCustomerId);
    if (!customer || !customer.isActive) {
      return res.error('Invalid customer', null, 'Customer not found or inactive', 400);
    }

    const availableQty = await getAvailableQuantityByItem(nextItemName, id);
    if (nextQty > availableQty) {
      return res.error(
        'Insufficient finished stock',
        { itemName: nextItemName, required: nextQty, available: availableQty },
        `Only ${availableQty} pieces available for ${nextItemName}`,
        400
      );
    }

    const ppp = pricePerPiece !== undefined && pricePerPiece !== null && pricePerPiece !== ''
      ? Number(pricePerPiece)
      : null;
    const totalAmount = ppp !== null ? Number((ppp * nextQty).toFixed(2)) : null;

    const updateData = {
      customerId: nextCustomerId,
      itemName: nextItemName,
      quantity: nextQty,
      unit: 'pieces',
      pricePerPiece: ppp,
      totalAmount,
      saleDate: saleDate ? new Date(saleDate) : existing.saleDate,
      notes: notes !== undefined ? (notes ? String(notes).trim() : null) : existing.notes
    };

    const updated = await Sale.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
      .populate('customerId', 'name companyName phone')
      .populate('soldBy', 'name email role');

    res.success('Sale updated successfully', updated, 'Sale has been updated successfully', 200);
  } catch (error) {
    res.error(
      error.message || 'Failed to update sale',
      error,
      'An error occurred while updating sale',
      500
    );
  }
};

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Sale.findByIdAndDelete(id);
    if (!deleted) {
      return res.error('Sale not found', null, 'The requested sale does not exist', 404);
    }
    res.success('Sale deleted successfully', deleted, 'Sale has been deleted successfully', 200);
  } catch (error) {
    res.error(
      error.message || 'Failed to delete sale',
      error,
      'An error occurred while deleting sale',
      500
    );
  }
};

