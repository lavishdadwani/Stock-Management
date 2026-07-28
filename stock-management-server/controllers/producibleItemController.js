import ProducibleItem from '../models/producibleItem.model.js';
import { logActivity } from '../utils/auditLog.js';

const VALID_WIRE_TYPES = ['aluminium', 'copper'];

// Get producible items available for checkout/purchase dropdowns (active only)
export const getActiveProducibleItems = async (req, res) => {
  try {
    const items = await ProducibleItem.find({ isActive: true }).sort({ itemName: 1 });
    res.success('Producible items fetched successfully', items, null, 200);
  } catch (error) {
    console.error('Error fetching producible items:', error);
    res.error(
      error.message || 'Failed to fetch producible items',
      error,
      'An error occurred while fetching producible items',
      500
    );
  }
};

// Get all producible items including inactive ones (admin management view)
export const getAllProducibleItems = async (req, res) => {
  try {
    const items = await ProducibleItem.find()
      .populate('createdBy', 'name email')
      .sort({ itemName: 1 });
    res.success('Producible items fetched successfully', items, null, 200);
  } catch (error) {
    console.error('Error fetching producible items:', error);
    res.error(
      error.message || 'Failed to fetch producible items',
      error,
      'An error occurred while fetching producible items',
      500
    );
  }
};

export const createProducibleItem = async (req, res) => {
  try {
    const { itemName, wireUsedType, wireKgPerPiece } = req.body;

    if (!itemName || !wireUsedType || wireKgPerPiece === undefined || wireKgPerPiece === null) {
      return res.error(
        'Missing required fields',
        null,
        'Please provide itemName, wireUsedType, and wireKgPerPiece',
        400
      );
    }

    if (!VALID_WIRE_TYPES.includes(wireUsedType)) {
      return res.error(
        'Invalid wireUsedType',
        null,
        `wireUsedType must be one of: ${VALID_WIRE_TYPES.join(', ')}`,
        400
      );
    }

    const qty = Number(wireKgPerPiece);
    if (isNaN(qty) || qty < 0) {
      return res.error(
        'Invalid wireKgPerPiece',
        null,
        'wireKgPerPiece must be a number greater than or equal to 0',
        400
      );
    }

    const item = await ProducibleItem.create({
      itemName: String(itemName).trim(),
      wireUsedType,
      wireKgPerPiece: qty,
      createdBy: req.userId
    });

    await logActivity({
      entityType: 'producibleItem',
      entityId: item._id,
      action: 'create',
      performedBy: req.userId,
      description: `Added producible item "${item.itemName}"`,
      after: item.toObject()
    });

    res.success('Producible item created successfully', item, 'Producible item added successfully', 201);
  } catch (error) {
    console.error('Error creating producible item:', error);
    if (error.code === 11000) {
      return res.error('Duplicate item name', null, 'A producible item with this name already exists', 409);
    }
    res.error(
      error.message || 'Failed to create producible item',
      error,
      'An error occurred while creating the producible item',
      500
    );
  }
};

export const updateProducibleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, wireUsedType, wireKgPerPiece, isActive } = req.body;

    const existing = await ProducibleItem.findById(id);
    if (!existing) {
      return res.error('Producible item not found', null, 'The requested item does not exist', 404);
    }
    const before = existing.toObject();

    if (wireUsedType !== undefined && !VALID_WIRE_TYPES.includes(wireUsedType)) {
      return res.error(
        'Invalid wireUsedType',
        null,
        `wireUsedType must be one of: ${VALID_WIRE_TYPES.join(', ')}`,
        400
      );
    }

    if (itemName !== undefined) existing.itemName = String(itemName).trim();
    if (wireUsedType !== undefined) existing.wireUsedType = wireUsedType;
    if (wireKgPerPiece !== undefined) {
      const qty = Number(wireKgPerPiece);
      if (isNaN(qty) || qty < 0) {
        return res.error(
          'Invalid wireKgPerPiece',
          null,
          'wireKgPerPiece must be a number greater than or equal to 0',
          400
        );
      }
      existing.wireKgPerPiece = qty;
    }
    if (isActive !== undefined) existing.isActive = !!isActive;

    await existing.save();

    await logActivity({
      entityType: 'producibleItem',
      entityId: existing._id,
      action: 'update',
      performedBy: req.userId,
      description: `Updated producible item "${existing.itemName}"`,
      before,
      after: existing.toObject()
    });

    res.success('Producible item updated successfully', existing, 'Producible item updated successfully', 200);
  } catch (error) {
    console.error('Error updating producible item:', error);
    if (error.code === 11000) {
      return res.error('Duplicate item name', null, 'A producible item with this name already exists', 409);
    }
    res.error(
      error.message || 'Failed to update producible item',
      error,
      'An error occurred while updating the producible item',
      500
    );
  }
};

export const deleteProducibleItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await ProducibleItem.findByIdAndDelete(id);

    if (!item) {
      return res.error('Producible item not found', null, 'The requested item does not exist', 404);
    }

    await logActivity({
      entityType: 'producibleItem',
      entityId: item._id,
      action: 'delete',
      performedBy: req.userId,
      description: `Deleted producible item "${item.itemName}"`,
      before: item.toObject()
    });

    res.success('Producible item deleted successfully', item, 'Producible item deleted successfully', 200);
  } catch (error) {
    console.error('Error deleting producible item:', error);
    res.error(
      error.message || 'Failed to delete producible item',
      error,
      'An error occurred while deleting the producible item',
      500
    );
  }
};
