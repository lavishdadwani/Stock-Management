import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SaleSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'customer',
      index: true
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
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
      enum: ['pieces'],
      default: 'pieces'
    },
    pricePerPiece: {
      type: Number,
      min: 0,
      default: null
    },
    totalAmount: {
      type: Number,
      min: 0,
      default: null
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
      index: true
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed'
    },
  },
  { timestamps: true }
);

SaleSchema.index({ itemName: 1, saleDate: -1 });
SaleSchema.index({ customerId: 1, saleDate: -1 });

const Sale = mongoose.model('sale', SaleSchema);

export default Sale;

