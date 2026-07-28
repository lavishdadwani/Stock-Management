import { Router } from 'express';
import {
  getOverview,
  getSalesTrend,
  getMaterialUsageTrend,
  getProductionSummary
} from '../controllers/analyticsController.js';
import { Auth, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/overview', Auth, authorize('manager', 'owner', 'super_admin'), getOverview);
router.get('/sales-trend', Auth, authorize('manager', 'owner', 'super_admin'), getSalesTrend);
router.get('/material-usage', Auth, authorize('manager', 'owner', 'super_admin'), getMaterialUsageTrend);
router.get('/production-summary', Auth, authorize('manager', 'owner', 'super_admin'), getProductionSummary);

export default router;
