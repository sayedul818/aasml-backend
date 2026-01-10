import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { uploadProjectFiles } from '../../middlewares/upload.middleware';
import { UserRole } from '../../types';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects
} from './project.controller';

const router = Router();

// Optional upload middleware - continues even if upload fails
const optionalUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadProjectFiles(req, res, (err: any) => {
    if (err) {
      console.warn('⚠️ File upload skipped:', err.message);
      // Continue without files
      req.files = undefined;
    }
    next();
  });
};

// Public routes
router.get('/', getAllProjects);
router.get('/search', searchProjects);
router.get('/:id', getProjectById);

// Protected routes (MEMBER, FACULTY, ADMIN)
router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  optionalUpload,
  createProject
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  optionalUpload,
  updateProject
);

// Admin only
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deleteProject
);

export default router;
