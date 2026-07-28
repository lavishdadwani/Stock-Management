import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ProducibleItemSchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    wireUsedType: {
      type: String,
      required: true,
      enum: ['aluminium', 'copper']
    },
    wireKgPerPiece: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  },
  { timestamps: true }
);

ProducibleItemSchema.index({ isActive: 1 });

const ProducibleItem = mongoose.model('producibleItem', ProducibleItemSchema);

export default ProducibleItem;
