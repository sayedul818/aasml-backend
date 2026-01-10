import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { uploadApplicationFiles } from '../../middlewares/upload.middleware';
import { UserRole } from '../../types';
import {
  getAllApplications,
  getApplicationById,
  submitApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats
} from './application.controller';

const router = Router();

// Public routes
router.post('/', uploadApplicationFiles, submitApplication);

// Protected routes (Faculty & Admin only)
router.get(
  '/stats',
  authMiddleware,
  roleMiddleware([UserRole.FACULTY, UserRole.ADMIN]),
  getApplicationStats
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware([UserRole.FACULTY, UserRole.ADMIN]),
  updateApplicationStatus
);

router.get(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.FACULTY, UserRole.ADMIN]),
  getAllApplications
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.FACULTY, UserRole.ADMIN]),
  getApplicationById
);

// Admin only
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deleteApplication
);

export default router;
