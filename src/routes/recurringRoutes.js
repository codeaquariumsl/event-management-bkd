import { Router } from 'express';
import {
  getRecurringEvents,
  createRecurringEvent,
  updateRecurringEvent,
  deleteRecurringEvent,
  generateEvents,
} from '../controllers/recurringController.js';

const router = Router();

router.get('/', getRecurringEvents);
router.post('/', createRecurringEvent);
router.put('/:id', updateRecurringEvent);
router.delete('/:id', deleteRecurringEvent);
router.post('/:id/generate', generateEvents);

export default router;
