import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { uploadPublicationPDF } from '../../middlewares/upload.middleware';
import { UserRole } from '../../types';
import {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  searchPublications
} from './publication.controller';

const router = Router();

// Allow continuing even if PDF upload fails (avoids blocking on Cloudinary issues)
const optionalUploadPDF = (req: Request, res: Response, next: NextFunction) => {
  uploadPublicationPDF(req, res, (err: any) => {
    if (err) {
      const message = err?.message || err?.code || err?.name || 'Unknown upload error';
      console.warn('⚠️ PDF upload skipped:', message, err);
      req.file = undefined as any;
    }
    next();
  });
};

// Public routes
router.get('/', getAllPublications);
router.get('/search', searchPublications);
router.get('/:id', getPublicationById);

// Protected routes (MEMBER, FACULTY, ADMIN)
router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  optionalUploadPDF,
  createPublication
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.FACULTY, UserRole.ADMIN]),
  optionalUploadPDF,
  updatePublication
);

// Admin only
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deletePublication
);

export default router;
