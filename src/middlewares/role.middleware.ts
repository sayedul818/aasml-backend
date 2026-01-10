import { Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { AuthRequest, UserRole } from '../types';

const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        throw ApiError.forbidden(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Helper middleware for specific roles
export const requireAdmin = roleMiddleware([UserRole.ADMIN]);
export const requireFaculty = roleMiddleware([UserRole.ADMIN, UserRole.FACULTY]);
export const requireMember = roleMiddleware([UserRole.ADMIN, UserRole.FACULTY, UserRole.MEMBER]);

export default roleMiddleware;
