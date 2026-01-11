import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import roleMiddleware from '../../middlewares/role.middleware';
import { uploadEventFiles } from '../../middlewares/upload.middleware';
import { UserRole } from '../../types';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent
  ,getEventRegistrations
} from './event.controller';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/:id/register', registerForEvent);
// Admin: get registrations for an event
router.get(
  '/:id/registrations',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  getEventRegistrations
);

// Protected routes (MEMBER, FACULTY, ADMIN)
router.post(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  uploadEventFiles,
  createEvent
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.MEMBER, UserRole.FACULTY, UserRole.ADMIN]),
  uploadEventFiles,
  updateEvent
);

// Admin only
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware([UserRole.ADMIN]),
  deleteEvent
);

export default router;
