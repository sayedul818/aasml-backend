import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Research from './research.model';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Validation schema
const researchSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(500),
  detailedDescription: z.string().max(5000).optional(),
  icon: z.string(),
  image: z.string().optional(),
  applications: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  color: z.string().optional(),
  tags: z.array(z.string()).optional(),
  relatedPublications: z.array(z.string()).optional(),
  relatedProjects: z.array(z.string()).optional(),
  datasets: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    description: z.string().optional()
  })).optional(),
  isActive: z.boolean().optional()
});

// Create research domain
export const createResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageUrl = (req.file as any)?.path;
    
    // Coerce arrays from string/array to array
    const coerceArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          return value.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
        return [value].filter(Boolean);
      }
      return [];
    };
    
    const validatedData = researchSchema.parse({
      ...req.body,
      description: req.body.description || req.body.shortDescription || '',
      icon: req.body.icon || '📚',
      applications: coerceArray(req.body.applications),
      tools: coerceArray(req.body.tools),
      tags: coerceArray(req.body.tags),
      ...(imageUrl ? { image: imageUrl } : {})
    });

    const research = await Research.create({
      ...validatedData,
      createdBy: req.user?.id
    });

    ApiResponse.created(res, 'Research domain created successfully', research);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

    // Get all research domains
    export const getAllResearch = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { isActive, tags } = req.query;
        const filter: any = {};

        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (tags) filter.tags = { $in: (tags as string).split(',') };

        const research = await Research.find(filter)
          .populate('relatedPublications', 'title year')
          .populate('relatedProjects', 'title status')
          .populate('createdBy', 'name email')
          .sort({ createdAt: -1 });

        ApiResponse.success(res, 'Research domains retrieved successfully', research);
      } catch (error) {
        next(error);
      }
    };

    // Get research by ID
    export const getResearchById = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const research = await Research.findById(req.params.id)
          .populate('relatedPublications')
          .populate('relatedProjects')
          .populate('createdBy', 'name email');

        if (!research) {
          throw ApiError.notFound('Research domain not found');
        }

        ApiResponse.success(res, 'Research domain retrieved successfully', research);
      } catch (error) {
        next(error);
      }
    };

// Update research domain
export const updateResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const imageUrl = (req.file as any)?.path;
    
    // Coerce arrays from string/array to array
    const coerceArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          return value.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
        return [value].filter(Boolean);
      }
      return [];
    };
    
    const validatedData = researchSchema.partial().parse({
      ...req.body,
      ...(req.body.shortDescription ? { description: req.body.shortDescription } : {}),
      ...(req.body.applications ? { applications: coerceArray(req.body.applications) } : {}),
      ...(req.body.tools ? { tools: coerceArray(req.body.tools) } : {}),
      ...(req.body.tags ? { tags: coerceArray(req.body.tags) } : {}),
      ...(imageUrl ? { image: imageUrl } : {})
    });

    const research = await Research.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!research) {
      throw ApiError.notFound('Research domain not found');
    }

    ApiResponse.success(res, 'Research domain updated successfully', research);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Delete research
export const deleteResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const research = await Research.findByIdAndDelete(req.params.id);

    if (!research) {
      throw ApiError.notFound('Research domain not found');
    }

    ApiResponse.success(res, 'Research domain deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Search research
export const searchResearch = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      throw ApiError.badRequest('Search query is required');
    }

    const research = await Research.find({
      $text: { $search: q as string }
    })
    .populate('relatedPublications', 'title year')
    .populate('relatedProjects', 'title status');

    ApiResponse.success(res, 'Search completed successfully', research);
  } catch (error) {
    next(error);
  }
};
