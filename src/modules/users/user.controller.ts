import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import User from '../users/user.model';
import ApiError from '../../utils/ApiError';
import ApiResponse from '../../utils/ApiResponse';

// Get all users (Admin only)
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    ApiResponse.success(res, 'Users fetched successfully', {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single user
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, 'User fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = user.toObject();
    delete (updatedUser as any).password;

    ApiResponse.success(res, 'User updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    ApiResponse.success(res, 'Profile fetched successfully', user);
  } catch (error) {
    next(error);
  }
};

// Update current user profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (name) user.name = name;

    await user.save();

    const updatedUser = user.toObject();
    delete (updatedUser as any).password;

    ApiResponse.success(res, 'Profile updated successfully', updatedUser);
  } catch (error) {
    next(error);
  }
};
