import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const StockSchema = new Schema(
  {
    itemName: {
      type: String,
      required: true,
      enum: ['Aluminium', 'Copper', 'Scrap']
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
    stockType: {
      type: String,
      enum: ['raw', 'finished', 'semi-finished'],
      default: 'raw'
    },
    category: {
      type: String,
      default: 'wire'
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    },
    addedDate: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// Index for faster queries
StockSchema.index({ itemName: 1 });
StockSchema.index({ stockType: 1 });
StockSchema.index({ addedBy: 1 });

const Stock = mongoose.model('Stock', StockSchema);

export default Stock;

