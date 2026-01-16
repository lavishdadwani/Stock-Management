import { Router } from 'express';
import {
  transferStock,
  getAllStockTransfers,
  getMyStockTransfers,
  getStockTransferById,
  updateStockTransfer,
  deleteStockTransfer,
  getStockTransferQuantities
} from '../controllers/stockTransferController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

// Transfer stock to core team member - only managers and owners
router.post('/transfer', Auth, authorize('manager', 'owner'), transferStock);

// Get all stock transfers - only managers and owners (can view all transfers)
router.get('/get-all', Auth, authorize('manager', 'owner'), getAllStockTransfers);

// Get stock transfer quantities - managers, owners, and core team (core team can only see their own)
router.get('/get-quantities', Auth, getStockTransferQuantities);

// Get my stock transfers - for core team members
router.get('/my-transfers', Auth, getMyStockTransfers);

// Update stock transfer - only managers and owners
router.put('/update/:id', Auth, authorize('manager', 'owner'), updateStockTransfer);

// Delete stock transfer - only managers and owners
router.delete('/delete/:id', Auth, authorize('manager', 'owner'), deleteStockTransfer);

// Get stock transfer by ID
router.get('/:id', Auth, getStockTransferById);

export default router;

