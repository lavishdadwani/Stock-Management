import { Router } from 'express';
import {
  createStock,
  getAllStock,
  getStockById,
  updateStock,
  deleteStock,
  getStockQuantities
} from '../controllers/stockController.js';
import { Auth } from '../middleware/auth.js';
const router = Router();

// Create new stock
router.post('/create',Auth, createStock);

// Get all stock
router.get('/get-all',Auth, getAllStock);

// Get stock quantities (Aluminium, Copper, Scrap) in KG
router.get('/get-all-quantities',Auth, getStockQuantities);

// Get stock by ID
router.get('/:id',Auth, getStockById);

// Update stock
router.put('/update/:id',Auth, updateStock);

// Delete stock
router.delete('/delete/:id',Auth, deleteStock);

export default router;

