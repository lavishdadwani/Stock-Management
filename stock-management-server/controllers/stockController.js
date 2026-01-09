import Stock from '../models/stock.model.js';
import User from '../models/user.model.js'; // Import User model to ensure it's registered
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

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

// Create new stock
export const createStock = async (req, res) => {
  try {
    const {
      itemName,
      quantity,
      unit,
      stockType,
      category,
      addedDate,
      description
    } = req.body;
    const userID = req.userId;
    
    // Validation
    if (!itemName || quantity === undefined || quantity === null || !unit) {
      return res.error(
        'Missing required fields: itemName, quantity, unit',
        null,
        'Please provide all required fields: item name, quantity, and unit',
        400
      );
    }

    // Convert quantity to KG
    const quantityInKg = convertToKg(quantity, unit);

    const stock = new Stock({
      itemName,
      quantity: quantityInKg,
      unit: 'kg', // Always save as kg in database
      stockType: stockType || 'raw',
      category: category || 'wire',
      addedBy: userID,
      addedDate: addedDate ? new Date(addedDate) : new Date(),
      description
    });

    const savedStock = await stock.save();
    
    res.success(
      'Stock created successfully',
      savedStock,
      'Stock item has been added successfully',
      201
    );
  } catch (error) {
    console.error('Error creating stock:', error);
    res.error(
      error.message || 'Failed to create stock',
      error,
      'An error occurred while creating the stock item',
      500
    );
  }
};

// Get all stock with pagination
export const getAllStock = async (req, res) => {
  try {
    const { stockType, itemName, search, page, limit } = req.query;
    
    // Get pagination parameters
    const { page: pageNum, limit: limitNum, skip } = getPaginationParams({ page, limit });
    
    // Build query
    const query = {};
    if (stockType) {
      query.stockType = stockType;
    }
    if (itemName) {
      query.itemName = itemName;
    }
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Stock.countDocuments(query);

    // Get paginated stocks
    const stocks = await Stock.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    // Format paginated response
    const paginatedData = formatPaginatedResponse(stocks, total, pageNum, limitNum);
    
    res.success(
      'Stock fetched successfully',
      paginatedData.data,
      null,
      200,
      paginatedData.pagination
    );
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.error(
      error.message || 'Failed to fetch stock',
      error,
      'An error occurred while fetching stock items',
      500
    );
  }
};

// Get stock by ID
export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stock = await Stock.findById(id).populate('addedBy', 'name');
    
    if (!stock) {
      return res.error(
        'Stock not found',
        null,
        'The requested stock item does not exist',
        404
      );
    }

    res.success(
      'Stock fetched successfully',
      stock,
      null,
      200
    );
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.error(
      error.message || 'Failed to fetch stock',
      error,
      'An error occurred while fetching the stock item',
      500
    );
  }
};

// Update stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert quantity to KG if provided
    if (updateData.quantity !== undefined && updateData.quantity !== null) {
      const inputUnit = updateData.unit || 'kg';
      updateData.quantity = convertToKg(updateData.quantity, inputUnit);
      updateData.unit = 'kg'; // Always save as kg in database
    } else if (updateData.unit) {
      // If unit is provided without quantity, just set to kg
      updateData.unit = 'kg';
    }

    // Convert addedDate to Date if provided
    if (updateData.addedDate) {
      updateData.addedDate = new Date(updateData.addedDate);
    }

    // Don't allow updating addedBy
    delete updateData.addedBy;

    const stock = await Stock.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('addedBy', 'name');

    if (!stock) {
      return res.error(
        'Stock not found',
        null,
        'The requested stock item does not exist',
        404
      );
    }

    res.success(
      'Stock updated successfully',
      stock,
      'Stock item has been updated successfully',
      200
    );
  } catch (error) {
    console.error('Error updating stock:', error);
    res.error(
      error.message || 'Failed to update stock',
      error,
      'An error occurred while updating the stock item',
      500
    );
  }
};

// Delete stock
export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stock = await Stock.findByIdAndDelete(id);

    if (!stock) {
      return res.error(
        'Stock not found',
        null,
        'The requested stock item does not exist',
        404
      );
    }

    res.success(
      'Stock deleted successfully',
      stock,
      'Stock item has been deleted successfully',
      200
    );
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.error(
      error.message || 'Failed to delete stock',
      error,
      'An error occurred while deleting the stock item',
      500
    );
  }
};

// Get stock quantities (Aluminium, Copper, Scrap) in KG
export const getStockQuantities = async (req, res) => {
  try {
    // Use aggregation to sum quantities by itemName (all quantities are already in KG)
    const quantities = await Stock.aggregate([
      {
        $group: {
          _id: '$itemName',
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Initialize quantities
    let aluminium = 0;
    let copper = 0;
    let scrap = 0;

    // Map aggregated results
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
      'Stock quantities fetched successfully',
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
    console.error('Error fetching stock quantities:', error);
    res.error(
      error.message || 'Failed to fetch stock quantities',
      error,
      'An error occurred while fetching stock quantities',
      500
    );
  }
};

