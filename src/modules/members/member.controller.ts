import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Member from './member.model';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Validation schema
const memberSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.enum(['Professor', 'Associate Professor', 'Assistant Professor', 'PhD Scholar', 'Masters Student', 'Research Assistant', 'Intern', 'Alumni']),
  designation: z.string(),
  education: z.string(),
  bio: z.string().max(1000),
  expertise: z.array(z.string()),
  email: z.string().email(),
  phone: z.string().optional(),
  image: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  googleScholar: z.string().optional(),
  researchGate: z.string().optional(),
  isActive: z.boolean().optional()
});

export class MemberController {
  // Get all members
  async getAllMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, isActive } = req.query;
      const filter: any = {};

      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const members = await Member.find(filter).sort({ joinedDate: -1 });

      ApiResponse.success(res, 'Members retrieved successfully', members);
    } catch (error) {
      next(error);
    }
  }

  // Get member by ID
  async getMemberById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await Member.findById(req.params.id);

      if (!member) {
        throw ApiError.notFound('Member not found');
      }

      ApiResponse.success(res, 'Member retrieved successfully', member);
    } catch (error) {
      next(error);
    }
  }

  // Create member
  async createMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Coerce expertise from string to array if needed
      const expertise = (() => {
        if (Array.isArray(req.body.expertise)) return req.body.expertise;
        if (typeof req.body.expertise === 'string') {
          try {
            const parsed = JSON.parse(req.body.expertise);
            if (Array.isArray(parsed)) return parsed;
          } catch (_) {
            // Fall back to comma-separated
            return req.body.expertise.split(',').map((e: string) => e.trim()).filter(Boolean);
          }
          return [req.body.expertise].filter(Boolean);
        }
        return undefined;
      })();

      const validatedData = memberSchema.parse({
        ...req.body,
        ...(expertise ? { expertise } : {})
      });

      // Get image URL from uploaded file
      const imageUrl = (req.file as any)?.path || validatedData.image;

      const member = await Member.create({
        ...validatedData,
        image: imageUrl
      });

      ApiResponse.created(res, 'Member created successfully', member);
    } catch (error) {
      next(error);
    }
  }

  // Update member
  async updateMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Coerce expertise from string to array if needed
      const expertise = (() => {
        if (Array.isArray(req.body.expertise)) return req.body.expertise;
        if (typeof req.body.expertise === 'string') {
          try {
            const parsed = JSON.parse(req.body.expertise);
            if (Array.isArray(parsed)) return parsed;
          } catch (_) {
            // Fall back to comma-separated
            return req.body.expertise.split(',').map((e: string) => e.trim()).filter(Boolean);
          }
          return [req.body.expertise].filter(Boolean);
        }
        return undefined;
      })();

      const validatedData = memberSchema.partial().parse({
        ...req.body,
        ...(expertise ? { expertise } : {})
      });

      // Get image URL if uploaded
      if (req.file) {
        validatedData.image = (req.file as any).path;
      }

      const member = await Member.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
      );

      if (!member) {
        throw ApiError.notFound('Member not found');
      }

      ApiResponse.success(res, 'Member updated successfully', member);
    } catch (error) {
      next(error);
    }
  }

  // Delete member
  async deleteMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await Member.findByIdAndDelete(req.params.id);

      if (!member) {
        throw ApiError.notFound('Member not found');
      }

      ApiResponse.success(res, 'Member deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new MemberController();
