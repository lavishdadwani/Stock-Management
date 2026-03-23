import { Router } from 'express';
import { Auth, authorize } from '../middleware/auth.js';
import {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  getAvailableSaleItems
} from '../controllers/saleController.js';

const router = Router();

router.post('/create', Auth, authorize('manager', 'owner', 'super_admin'), createSale);
router.get('/get-all', Auth, authorize('manager', 'owner', 'super_admin'), getAllSales);
router.get('/available-items', Auth, authorize('manager', 'owner', 'super_admin'), getAvailableSaleItems);
router.get('/:id', Auth, authorize('manager', 'owner', 'super_admin'), getSaleById);
router.put('/update/:id', Auth, authorize('manager', 'owner', 'super_admin'), updateSale);
router.delete('/delete/:id', Auth, authorize('manager', 'owner', 'super_admin'), deleteSale);

export default router;

