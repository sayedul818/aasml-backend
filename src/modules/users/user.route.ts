import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { UserRole } from '../../types';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
} from './user.controller';

const router = Router();

// Profile routes (authenticated users)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

// Admin routes
router.get('/', authMiddleware, roleMiddleware([UserRole.ADMIN]), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), getUserById);
router.put('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware([UserRole.ADMIN]), deleteUser);

export default router;
