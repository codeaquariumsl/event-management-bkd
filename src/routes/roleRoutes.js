import { Router } from 'express';
import {
  getRoles,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getRolesMatrix,
} from '../controllers/userController.js';

const router = Router();

// Matrix route MUST be before /:name to prevent param matching conflict
router.get('/matrix', getRolesMatrix);
router.get('/', getRoles);
router.get('/:name', getRoleByName);
router.post('/', createRole);
router.put('/:name', updateRole);
router.delete('/:name', deleteRole);

export default router;
