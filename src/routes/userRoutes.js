import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  getRolesMatrix,
} from '../controllers/userController.js';

const router = Router();

router.get('/roles/matrix', getRolesMatrix);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', changePassword);
router.post('/:id/change-password', changePassword);
router.delete('/:id', deleteUser);

export default router;
