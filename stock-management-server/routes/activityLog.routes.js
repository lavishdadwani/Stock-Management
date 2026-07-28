import { Router } from 'express';
import { getActivityLog } from '../controllers/activityLogController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

// View activity log - only managers and owners
router.get('/', Auth, authorize('manager', 'owner', 'super_admin'), getActivityLog);

export default router;
