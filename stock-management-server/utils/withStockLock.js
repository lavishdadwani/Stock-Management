import mongoose from 'mongoose';
import StockLock from '../models/stockLock.model.js';

const MAX_ATTEMPTS = 5;
const isTransientTxnError = (error) =>
  error?.errorLabelSet?.has?.('TransientTransactionError') ||
  (Array.isArray(error?.errorLabels) && error.errorLabels.includes('TransientTransactionError'));

// Runs `fn(session)` inside a MongoDB transaction, serialized per material.
// `fn` must perform its "read available stock" + "write" logic using the
// provided session so it participates in the same transaction. Bumping the
// per-material lock document first means two concurrent calls for the same
// itemName always write-conflict on that one document - the loser aborts
// and retries, re-reading a now up-to-date stock total instead of racing.
const withStockLock = async (itemName, fn) => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      await StockLock.findOneAndUpdate(
        { itemName },
        { $inc: { version: 1 } },
        { session, upsert: true }
      );

      const result = await fn(session);

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction().catch(() => {});

      if (isTransientTxnError(error) && attempt < MAX_ATTEMPTS) {
        continue;
      }
      throw error;
    } finally {
      session.endSession();
    }
  }
};

export default withStockLock;
