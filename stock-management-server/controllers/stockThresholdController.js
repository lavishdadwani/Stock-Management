import StockThreshold from '../models/stockThreshold.model.js';
import { evaluateStockLevel } from '../utils/stockAlerts.js';

const VALID_ITEMS = ['aluminium', 'copper', 'scrap'];

// Get all configured thresholds
export const getThresholds = async (req, res) => {
  try {
    const thresholds = await StockThreshold.find().populate('updatedBy', 'name email');
    res.success('Thresholds fetched successfully', thresholds, null, 200);
  } catch (error) {
    console.error('Error fetching thresholds:', error);
    res.error(
      error.message || 'Failed to fetch thresholds',
      error,
      'An error occurred while fetching stock thresholds',
      500
    );
  }
};

// Create or update the threshold for a material
export const setThreshold = async (req, res) => {
  try {
    const { itemName, thresholdKg } = req.body;

    if (!itemName || !VALID_ITEMS.includes(itemName)) {
      return res.error(
        'Invalid itemName',
        null,
        `itemName must be one of: ${VALID_ITEMS.join(', ')}`,
        400
      );
    }

    if (thresholdKg === undefined || thresholdKg === null || isNaN(thresholdKg) || thresholdKg < 0) {
      return res.error(
        'Invalid thresholdKg',
        null,
        'thresholdKg must be a number greater than or equal to 0',
        400
      );
    }

    const threshold = await StockThreshold.findOneAndUpdate(
      { itemName },
      { thresholdKg, updatedBy: req.userId },
      { new: true, upsert: true, runValidators: true }
    );

    // Re-evaluate immediately in case the new threshold is already breached
    await evaluateStockLevel(itemName);

    res.success(
      'Threshold saved successfully',
      threshold,
      'Low stock threshold has been updated',
      200
    );
  } catch (error) {
    console.error('Error setting threshold:', error);
    res.error(
      error.message || 'Failed to set threshold',
      error,
      'An error occurred while saving the stock threshold',
      500
    );
  }
};
