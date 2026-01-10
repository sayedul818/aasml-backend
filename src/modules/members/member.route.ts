import { Router } from 'express';
import MemberController from './member.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireFaculty, requireAdmin } from '../../middlewares/role.middleware';
import { uploadMemberImage } from '../../middlewares/upload.middleware';

const router = Router();

/**
 * @route   GET /api/members
 * @desc    Get all members
 * @access  Public
 */
router.get('/', MemberController.getAllMembers.bind(MemberController));

/**
 * @route   GET /api/members/:id
 * @desc    Get member by ID
 * @access  Public
 */
router.get('/:id', MemberController.getMemberById.bind(MemberController));

/**
 * @route   POST /api/members
 * @desc    Create new member
 * @access  Private (Faculty, Admin)
 */
router.post(
  '/',
  authMiddleware,
  requireFaculty,
  uploadMemberImage,
  MemberController.createMember.bind(MemberController)
);

/**
 * @route   PUT /api/members/:id
 * @desc    Update member
 * @access  Private (Faculty, Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  requireFaculty,
  uploadMemberImage,
  MemberController.updateMember.bind(MemberController)
);

/**
 * @route   DELETE /api/members/:id
 * @desc    Delete member
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireAdmin,
  MemberController.deleteMember.bind(MemberController)
);

export default router;
