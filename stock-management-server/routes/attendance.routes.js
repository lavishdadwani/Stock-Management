import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getCheckInStatus,
  getMyAttendanceHistory,
  getAttendanceHistoryForUser,
  getAttendanceRecordById,
  getProducibleItems,
  exportMyAttendanceCsv,
  exportAttendanceCsvForUser
} from '../controllers/attendanceController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/producible-items', Auth, getProducibleItems);
router.get(
  '/user/:userId/history',
  Auth,
  authorize('manager', 'owner'),
  getAttendanceHistoryForUser
);
router.get(
  '/user/:userId/export-csv',
  Auth,
  authorize('manager', 'owner'),
  exportAttendanceCsvForUser
);
router.get(
  '/record/:attendanceId',
  Auth,
  authorize('manager', 'owner'),
  getAttendanceRecordById
);

// all can be accessed by core team
// Check-in
router.post('/check-in', Auth, authorize('core_team'), checkIn);

// Check-out
router.post('/check-out', Auth, authorize('core_team'), checkOut);

// Get current check-in status
router.get('/check-in-status', Auth, authorize('core_team'), getCheckInStatus);

// Get my attendance history
router.get('/my-history', Auth, authorize('core_team'), getMyAttendanceHistory);

// Export my attendance history as CSV
router.get('/my-history/export-csv', Auth, authorize('core_team'), exportMyAttendanceCsv);

export default router;
