import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { uploadResearchImage } from '../../middlewares/upload.middleware';
import { UserRole } from '../../types';
import {
  getAllResearch,
  getResearchById,
  createResearch,
  updateResearch,
  deleteResearch,
  searchResearch
} from './research.controller';

const router = Router();

// Public routes
router.get('/', getAllResearch);
router.get('/search', searchResearch);
router.get('/:id', getResearchById);

// Protected routes (MEMBER, FACULTY, ADMIN)
router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  uploadResearchImage,
  createResearch
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  uploadResearchImage,
  updateResearch
);

// Admin only
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deleteResearch
);

export default router;
