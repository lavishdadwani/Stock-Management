import { Router } from 'express';
import { Auth, authorize } from '../middleware/auth.js';
import {
  getAllItemProduced,
  getItemProducedTotals,
  createPurchasedFromCustomer
} from '../controllers/itemProducedController.js';

const router = Router();

// Get produced items (core team sees only their own)
router.get('/get-all', Auth, getAllItemProduced);
router.get('/totals', Auth, getItemProducedTotals);
router.post(
  '/purchase-from-customer',
  Auth,
  authorize('manager', 'owner', 'super_admin'),
  createPurchasedFromCustomer
);

export default router;

