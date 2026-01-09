import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ItemProducedSchema = new Schema(
  {
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Attendance',
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
      enum: ['kg', 'g', 'ton'],
      default: 'kg'
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
    }
  },
  { timestamps: true }
);

ItemProducedSchema.index({ attendanceId: 1 });
ItemProducedSchema.index({ userId: 1 });
ItemProducedSchema.index({ itemName: 1 });
ItemProducedSchema.index({ productionDate: -1 });

const ItemProduced = mongoose.model('ItemProduced', ItemProducedSchema);

export default ItemProduced;

