import { Router } from 'express';
import {
  getRecurringEvents,
  createRecurringEvent,
  generateEvents,
} from '../controllers/recurringController.js';

const router = Router();

router.get('/', getRecurringEvents);
router.post('/', createRecurringEvent);
router.post('/:id/generate', generateEvents);

export default router;
