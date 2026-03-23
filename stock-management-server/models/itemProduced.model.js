import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ItemProducedSchema = new Schema(
  {
    /** In-house checkout production vs bought back from a customer */
    source: {
      type: String,
      enum: ['produced', 'purchased'],
      default: 'produced',
      index: true
    },
    /** Set when source is `produced` (checkout). Null for purchases. */
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      default: null,
      ref: 'attendance',
      index: true
    },
    /** Customer we purchased finished goods from (source `purchased` only). */
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'customer',
      default: null,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
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
      enum: ['kg', 'g', 'pieces'],
      default: 'pieces'
    },
    productionDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      default: null
    },
    wireUsedType: {
      type: String,
      enum: ['aluminium', 'copper'],
      default: null
    },
    wireUsedQuantity: {
      type: Number,
      min: 0,
      default: null
    },
    scrapQuantity: {
      type: Number,
      min: 0,
      default: null
    },
    pricePerPiece: {
      type: Number,
      min: 0,
      default: null
    },
    totalPurchaseAmount: {
      type: Number,
      min: 0,
      default: null
    }
  },
  { timestamps: true }
);

ItemProducedSchema.index({ attendanceId: 1 });
ItemProducedSchema.index({ userId: 1 });
ItemProducedSchema.index({ itemName: 1 });
ItemProducedSchema.index({ productionDate: -1 });

const ItemProduced = mongoose.model('itemProduced', ItemProducedSchema);

export default ItemProduced;

