import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StockThresholdSchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
      enum: ['aluminium', 'copper', 'scrap'],
      unique: true
    },
    thresholdKg: {
      type: Number,
      required: true,
      min: 0
    },
    alertActive: {
      type: Boolean,
      default: false
    },
    alertSentAt: {
      type: Date,
      default: null
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  },
  { timestamps: true }
);

const StockThreshold = mongoose.model('stockThreshold', StockThresholdSchema);

export default StockThreshold;
