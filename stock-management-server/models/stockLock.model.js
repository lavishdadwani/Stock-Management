import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// One document per material. Every stock-deducting operation bumps `version`
// inside the same transaction, so two concurrent operations on the same
// material always collide on this document and MongoDB serializes them via
// a write conflict + retry, instead of both reading a stale available-stock total.
const StockLockSchema = new Schema({
  itemName: {
    type: String,
    required: true,
    enum: ['aluminium', 'copper', 'scrap'],
    unique: true
  },
  version: {
    type: Number,
    default: 0
  }
});

const StockLock = mongoose.model('stockLock', StockLockSchema);

export default StockLock;
