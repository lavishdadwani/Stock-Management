import { Router } from 'express';
import {
  createStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
  getStockQuantities,
  exportStockCsv
} from '../controllers/stockController.js';
import { Auth, authorize } from '../middleware/auth.js';
const router = Router();

// Create new stock - only managers and owners
router.post('/create', Auth, authorize('manager', 'owner', 'super_admin'), createStock);

// Get all stock
router.get('/get-all',Auth, getAllStock);

// Get stock quantities (Aluminium, Copper, Scrap) in KG
router.get('/get-all-quantities',Auth, getStockQuantities);

// Export stock ledger as CSV - only managers and owners
router.get('/export-csv', Auth, authorize('manager', 'owner', 'super_admin'), exportStockCsv);

// Get stock by ID
router.get('/:id',Auth, getStockById);

// Update stock - only managers and owners
router.put('/update/:id', Auth, authorize('manager', 'owner', 'super_admin'), updateStock);

// Delete stock - only managers and owners
router.delete('/delete/:id', Auth, authorize('manager', 'owner', 'super_admin'), deleteStock);

export default router;

