import { Router } from 'express';
import { Auth, authorize } from '../middleware/auth.js';
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = Router();

// Manager/Owner customer management
router.post('/create', Auth, authorize('manager', 'owner', 'super_admin'), createCustomer);
router.get('/get-all', Auth, authorize('manager', 'owner', 'super_admin'), getAllCustomers);
router.get('/:id', Auth, authorize('manager', 'owner', 'super_admin'), getCustomerById);
router.put('/update/:id', Auth, authorize('manager', 'owner', 'super_admin'), updateCustomer);
router.delete('/delete/:id', Auth, authorize('manager', 'owner', 'super_admin'), deleteCustomer);

export default router;

