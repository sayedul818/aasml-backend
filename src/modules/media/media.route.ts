import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { UserRole } from '../../types';
import { getAllMedia, getMediaByFolder, deleteMedia } from './media.controller';

const router = Router();

// Admin only routes
router.get(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  getAllMedia
);

router.get(
  '/folder/:folder',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  getMediaByFolder
);

router.delete(
  '/:publicId',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deleteMedia
);

export default router;
