import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StockTransferSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
      index: true
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
      index: true
    },
    itemName: {
      type: String,
      required: true,
      enum: ['Aluminium', 'Copper', 'Scrap'],
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'g', 'ton'],
      default: 'kg'
    },
    transferDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'completed'
    },
    stockEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
StockTransferSchema.index({ fromUserId: 1 });
StockTransferSchema.index({ toUserId: 1 });
StockTransferSchema.index({ itemName: 1 });
StockTransferSchema.index({ transferDate: -1 });
StockTransferSchema.index({ fromUserId: 1, toUserId: 1 });

const StockTransfer = mongoose.model('StockTransfer', StockTransferSchema);

export default StockTransfer;

