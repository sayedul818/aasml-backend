import { Router } from 'express';
import authRoutes from './modules/auth/auth.route';
import userRoutes from './modules/users/user.route';
import memberRoutes from './modules/members/member.route';
import researchRoutes from './modules/research/research.route';
import projectRoutes from './modules/projects/project.route';
import publicationRoutes from './modules/publications/publication.route';
import eventRoutes from './modules/events/event.route';
import applicationRoutes from './modules/applications/application.route';
import mediaRoutes from './modules/media/media.route';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'AASML Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/members', memberRoutes);
router.use('/research', researchRoutes);
router.use('/projects', projectRoutes);
router.use('/publications', publicationRoutes);
router.use('/events', eventRoutes);
router.use('/applications', applicationRoutes);
router.use('/media', mediaRoutes);

export default router;
