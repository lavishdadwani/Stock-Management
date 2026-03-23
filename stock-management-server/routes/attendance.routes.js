import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getCheckInStatus,
  getMyAttendanceHistory,
  getProducibleItems
} from '../controllers/attendanceController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();
// all can be accessed by core team 
// Check-in 
router.post('/check-in', Auth, authorize('core_team'), checkIn);

// Check-out
router.post('/check-out', Auth, authorize('core_team'), checkOut);

// Get current check-in status
router.get('/check-in-status', Auth, authorize('core_team'), getCheckInStatus);

// Get my attendance history
router.get('/my-history', Auth, authorize('core_team'), getMyAttendanceHistory);

// Get list of producible items - accessible to core team, manager, and owner// 
router.get('/producible-items', Auth, getProducibleItems);

export default router;
