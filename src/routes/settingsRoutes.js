import { Router } from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  getServices,
  getServiceCategories,
  getServicePresets,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/settingsController.js';

const router = Router();

// Profile routes
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

// Specific routes (MUST come before /:id)
router.get('/services/categories', getServiceCategories);
router.get('/services/presets', getServicePresets);
router.get('/categories', getServiceCategories);
router.get('/presets', getServicePresets);

// Services routes (when mounted at /api/settings)
router.get('/services', getServices);
router.post('/services', createService);
router.get('/services/:id', getServiceById);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// Direct root services routes (when mounted at /api/services)
router.get('/', getServices);
router.post('/', createService);
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;
