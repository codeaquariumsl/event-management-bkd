import { Router } from 'express';
import {
  getEventTypes,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType,
} from '../controllers/eventTypeController.js';

const router = Router();

router.get('/', getEventTypes);
router.get('/:id', getEventTypeById);
router.post('/', createEventType);
router.put('/:id', updateEventType);
router.delete('/:id', deleteEventType);

export default router;
