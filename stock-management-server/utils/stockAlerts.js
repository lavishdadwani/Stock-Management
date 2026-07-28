import Stock from '../models/stock.model.js';
import StockThreshold from '../models/stockThreshold.model.js';
import User from '../models/user.model.js';
import { sendLowStockAlert } from './emailService.js';

// Re-checks total stock for itemName against its configured threshold and
// sends/clears a low-stock alert email as needed. Called after any operation
// that changes a material's total quantity (restock, transfer, manual edit).
const evaluateStockLevel = async (itemName) => {
  try {
    const threshold = await StockThreshold.findOne({ itemName });
    if (!threshold) {
      return; // no threshold configured for this material - nothing to check
    }

    const aggregation = await Stock.aggregate([
      { $match: { itemName } },
      { $group: { _id: '$itemName', totalQuantity: { $sum: '$quantity' } } }
    ]);
    const totalQuantity = aggregation.length > 0 ? aggregation[0].totalQuantity : 0;

    const isBelowThreshold = totalQuantity <= threshold.thresholdKg;

    if (isBelowThreshold && !threshold.alertActive) {
      const recipients = await User.find({
        role: { $in: ['manager', 'owner', 'super_admin'] },
        isActive: true
      }).select('email');

      await sendLowStockAlert(
        recipients.map((u) => u.email),
        itemName,
        Math.round(totalQuantity * 100) / 100,
        threshold.thresholdKg
      );

      threshold.alertActive = true;
      threshold.alertSentAt = new Date();
      await threshold.save();
    } else if (!isBelowThreshold && threshold.alertActive) {
      threshold.alertActive = false;
      await threshold.save();
    }
  } catch (error) {
    // Alerting must never break the stock operation that triggered it
    console.error(`Error evaluating stock level for ${itemName}:`, error);
  }
};

export { evaluateStockLevel };
