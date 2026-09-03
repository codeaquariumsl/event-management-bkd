import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/reportController.js';

const router = Router();

router.get('/dashboard', getDashboardMetrics);

export default router;
