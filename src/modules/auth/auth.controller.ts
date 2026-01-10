import { Response, NextFunction } from 'express';
import { z } from 'zod';
import AuthService from './auth.service';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest, UserRole } from '../../types';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(UserRole).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6)
});

export class AuthController {
  // Register
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      const { user, token } = await AuthService.register(
        validatedData.name,
        validatedData.email,
        validatedData.password,
        validatedData.role
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      ApiResponse.created(res, 'User registered successfully', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const { user, token } = await AuthService.login(
        validatedData.email,
        validatedData.password
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      ApiResponse.success(res, 'Login successful', {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const user = await AuthService.getMe(req.user.id);

      ApiResponse.success(res, 'User profile retrieved', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error) {
      next(error);
    }
  }

  // Update password
  async updatePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Not authenticated');
      }

      const validatedData = updatePasswordSchema.parse(req.body);

      await AuthService.updatePassword(
        req.user.id,
        validatedData.currentPassword,
        validatedData.newPassword
      );

      ApiResponse.success(res, 'Password updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Logout
  async logout(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('token');
      ApiResponse.success(res, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
