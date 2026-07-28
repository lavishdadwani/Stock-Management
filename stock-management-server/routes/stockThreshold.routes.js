import { Router } from 'express';
import { getThresholds, setThreshold } from '../controllers/stockThresholdController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

// Get all configured low-stock thresholds
router.get('/', Auth, getThresholds);

// Create/update a threshold - only managers and owners
router.post('/', Auth, authorize('manager', 'owner', 'super_admin'), setThreshold);

export default router;
