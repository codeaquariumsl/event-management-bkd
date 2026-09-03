import { Router } from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  getServices,
  createService,
} from '../controllers/settingsController.js';

const router = Router();

router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);
router.get('/services', getServices);
router.post('/services', createService);

export default router;
