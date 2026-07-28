import { Router } from 'express';
import {
  getActiveProducibleItems,
  getAllProducibleItems,
  createProducibleItem,
  updateProducibleItem,
  deleteProducibleItem
} from '../controllers/producibleItemController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

// Active items only - used by checkout/purchase dropdowns, any authenticated role
router.get('/', Auth, getActiveProducibleItems);

// All items including inactive - admin management view
router.get('/all', Auth, authorize('manager', 'owner', 'super_admin'), getAllProducibleItems);

router.post('/create', Auth, authorize('manager', 'owner', 'super_admin'), createProducibleItem);
router.put('/update/:id', Auth, authorize('manager', 'owner', 'super_admin'), updateProducibleItem);
router.delete('/delete/:id', Auth, authorize('manager', 'owner', 'super_admin'), deleteProducibleItem);

export default router;
