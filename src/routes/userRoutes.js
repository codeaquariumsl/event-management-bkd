import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getRoles,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getRolesMatrix,
} from '../controllers/userController.js';

const router = Router();

// Roles endpoints
router.get('/roles/matrix', getRolesMatrix);
router.get('/roles', getRoles);
router.get('/roles/:name', getRoleByName);
router.post('/roles', createRole);
router.put('/roles/:name', updateRole);
router.delete('/roles/:name', deleteRole);

// Direct / endpoints for when mounted on /api/roles
router.get('/matrix', getRolesMatrix);

// Users endpoints
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', changePassword);
router.post('/:id/change-password', changePassword);
router.delete('/:id', deleteUser);

export default router;
