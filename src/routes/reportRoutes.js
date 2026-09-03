import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/reportController.js';

const router = Router();

router.get('/metrics', getDashboardMetrics);
router.get('/summary', getDashboardMetrics);

export default router;
