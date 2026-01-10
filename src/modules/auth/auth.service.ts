import jwt from 'jsonwebtoken';
import User from '../users/user.model';
import ApiError from '../../utils/ApiError';
import { IUser, JWTPayload, UserRole } from '../../types';

export class AuthService {
  // Generate JWT token
  private generateToken(payload: JWTPayload): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpire = process.env.JWT_EXPIRE || '7d';

    if (!jwtSecret) {
      throw ApiError.internal('JWT_SECRET is not configured');
    }

    return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpire } as jwt.SignOptions);
  }

  // Register new user
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.PUBLIC
  ): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // Generate token
    const token = this.generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  // Login user
  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string }> {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Remove password from response
    user.password = undefined as any;

    return { user, token };
  }

  // Get current user profile
  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  // Update password
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }
}

export default new AuthService();
