import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Publication from './publication.model';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Validation schema
const publicationSchema = z.object({
  title: z.string().min(3).max(300),
  authors: z.array(z.string()).min(1),
  venue: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 5),
  type: z.enum(['JOURNAL', 'CONFERENCE', 'WORKSHOP', 'PREPRINT', 'BOOK_CHAPTER', 'THESIS']),
  abstract: z.string().min(10).max(2000),
  doi: z.string().optional(),
  pdfUrl: z.string().optional(),
  externalLink: z.string().url().optional(),
  citations: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  researchDomain: z.string().optional(),
  isActive: z.boolean().optional()
});

// Get all publications
export const getAllPublications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, year, researchDomain, isActive } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (year) filter.year = Number(year);
    if (researchDomain) filter.researchDomain = researchDomain;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const publications = await Publication.find(filter)
      .populate('researchDomain', 'title icon')
      .populate('createdBy', 'name email')
      .sort({ year: -1, createdAt: -1 });

    ApiResponse.success(res, 'Publications retrieved successfully', publications);
  } catch (error) {
    next(error);
  }
};

// Get publication by ID
export const getPublicationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate('researchDomain')
      .populate('createdBy', 'name email');

    if (!publication) {
      throw ApiError.notFound('Publication not found');
    }

    ApiResponse.success(res, 'Publication retrieved successfully', publication);
  } catch (error) {
    next(error);
  }
};

// Create publication
export const createPublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pdfPath = (req.file as any)?.path;
    const authors = (() => {
      if (Array.isArray(req.body.authors)) return req.body.authors;
      if (typeof req.body.authors === 'string') {
        try {
          const parsed = JSON.parse(req.body.authors);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          // Fall back to comma-separated authors
          return req.body.authors.split(',').map((a: string) => a.trim()).filter(Boolean);
        }
        return [req.body.authors].filter(Boolean);
      }
      return undefined;
    })();

    const tags = (() => {
      if (Array.isArray(req.body.tags)) return req.body.tags;
      if (typeof req.body.tags === 'string') {
        try {
          const parsed = JSON.parse(req.body.tags);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          return req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
        return [req.body.tags].filter(Boolean);
      }
      return undefined;
    })();

    const validatedData = publicationSchema.parse({
      ...req.body,
      ...(authors ? { authors } : {}),
      ...(tags ? { tags } : {}),
      ...(req.body.year ? { year: Number(req.body.year) } : {}),
      ...(pdfPath ? { pdfUrl: pdfPath } : {})
    });

    const publication = await Publication.create({
      ...validatedData,
      createdBy: req.user?.id
    });

    ApiResponse.created(res, 'Publication created successfully', publication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Update publication
export const updatePublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pdfPath = (req.file as any)?.path;
    const authors = (() => {
      if (Array.isArray(req.body.authors)) return req.body.authors;
      if (typeof req.body.authors === 'string') {
        try {
          const parsed = JSON.parse(req.body.authors);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          return req.body.authors.split(',').map((a: string) => a.trim()).filter(Boolean);
        }
        return [req.body.authors].filter(Boolean);
      }
      return undefined;
    })();

    const tags = (() => {
      if (Array.isArray(req.body.tags)) return req.body.tags;
      if (typeof req.body.tags === 'string') {
        try {
          const parsed = JSON.parse(req.body.tags);
          if (Array.isArray(parsed)) return parsed;
        } catch (_) {
          return req.body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        }
        return [req.body.tags].filter(Boolean);
      }
      return undefined;
    })();

    const validatedData = publicationSchema.partial().parse({
      ...req.body,
      ...(authors ? { authors } : {}),
      ...(tags ? { tags } : {}),
      ...(req.body.year ? { year: Number(req.body.year) } : {}),
      ...(pdfPath ? { pdfUrl: pdfPath } : {})
    });

    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!publication) {
      throw ApiError.notFound('Publication not found');
    }

    ApiResponse.success(res, 'Publication updated successfully', publication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Delete publication
export const deletePublication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);

    if (!publication) {
      throw ApiError.notFound('Publication not found');
    }

    ApiResponse.success(res, 'Publication deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Search publications
export const searchPublications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      throw ApiError.badRequest('Search query is required');
    }

    const publications = await Publication.find({
      $text: { $search: q as string }
    })
    .populate('researchDomain', 'title')
    .sort({ year: -1 });

    ApiResponse.success(res, 'Search completed successfully', publications);
  } catch (error) {
    next(error);
  }
};
