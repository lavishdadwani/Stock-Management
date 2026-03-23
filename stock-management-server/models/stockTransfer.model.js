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
      enum: ['aluminium', 'copper', 'scrap'],
      index: true
    },
    quantity: {
      type: Number,
      required: true,
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
    entryType: {
      type: String,
      enum: ['transfer_in', 'consume_wire', 'generate_scrap'],
      default: 'transfer_in',
      index: true
    },
    stockEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'stock',
      required: false,
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

const StockTransfer = mongoose.model('stockTransfer', StockTransferSchema);

export default StockTransfer;

