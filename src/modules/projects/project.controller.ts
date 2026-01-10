import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Project from './project.model';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Validation schema
const projectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  detailedDescription: z.string().max(10000).optional(),
  category: z.string().optional(),
  status: z.enum(['Ongoing', 'Completed', 'Upcoming']).optional(),
  startDate: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      return val.includes('T') ? val : new Date(val).toISOString();
    }
    return val instanceof Date ? val.toISOString() : val;
  }).optional(),
  endDate: z.string().or(z.date()).transform(val => {
    if (typeof val === 'string') {
      return val.includes('T') ? val : new Date(val).toISOString();
    }
    return val instanceof Date ? val.toISOString() : val;
  }).optional(),
  students: z.array(z.string()).optional(),
  supervisor: z.string().optional(),
  tools: z.array(z.string()).optional(),
  github: z.string().optional(),
  demo: z.string().optional(),
  fundingAgency: z.string().optional(),
  budget: z.number().min(0).optional(),
  teamMembers: z.array(z.string()).optional(),
  researchDomain: z.string().optional(),
  images: z.array(z.string()).optional(),
  documents: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  technologies: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

// Get all projects
export const getAllProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, researchDomain, isActive } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (researchDomain) filter.researchDomain = researchDomain;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const projects = await Project.find(filter)
      .populate('teamMembers', 'name role image')
      .populate('researchDomain', 'title icon')
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    ApiResponse.success(res, 'Projects retrieved successfully', projects);
  } catch (error) {
    next(error);
  }
};

// Get project by ID
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers')
      .populate('researchDomain')
      .populate('createdBy', 'name email');

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    ApiResponse.success(res, 'Project retrieved successfully', project);
  } catch (error) {
    next(error);
  }
};

// Create project
export const createProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log('📎 Received files:', {
      hasImages: !!files?.images,
      imageCount: files?.images?.length || 0,
      hasDocuments: !!files?.documents,
      documentCount: files?.documents?.length || 0,
    });
    
    // Coerce arrays from strings
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
    
    // Prepare data for validation
    const bodyData = {
      ...req.body,
      students: coerceArray(req.body.students),
      tools: coerceArray(req.body.tools),
      technologies: coerceArray(req.body.technologies),
      outcomes: coerceArray(req.body.outcomes),
      teamMembers: coerceArray(req.body.teamMembers),
      // Add uploaded file URLs
      images: (files?.images || files?.image)?.map(file => file.path) || [],
      documents: (files?.documents || files?.report)?.map(file => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype
      })) || [],
      status: req.body.status || 'Ongoing'
    };

    const validatedData = projectSchema.parse(bodyData);

    const project = await Project.create({
      ...validatedData,
      createdBy: req.user?.id
    });

    ApiResponse.created(res, 'Project created successfully', project);
  } catch (error) {
    console.error('❌ Project creation error:', error);
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Update project
export const updateProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Coerce arrays from strings
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
    
    // Prepare data for validation
    const bodyData = {
      ...req.body,
      students: coerceArray(req.body.students),
      tools: coerceArray(req.body.tools),
      technologies: coerceArray(req.body.technologies),
      outcomes: coerceArray(req.body.outcomes),
      teamMembers: coerceArray(req.body.teamMembers)
    };

    // Add new uploaded files if any
    if (files?.images) {
      bodyData.images = files.images.map(file => file.path);
    }
    if (files?.documents) {
      bodyData.documents = files.documents.map(file => ({
        name: file.originalname,
        url: file.path,
        type: file.mimetype
      }));
    }

    const validatedData = projectSchema.partial().parse(bodyData);

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    ApiResponse.success(res, 'Project updated successfully', project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Delete project
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    ApiResponse.success(res, 'Project deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Search projects
export const searchProjects = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q) {
      throw ApiError.badRequest('Search query is required');
    }

    const projects = await Project.find({
      $text: { $search: q as string }
    })
    .populate('teamMembers', 'name role')
    .populate('researchDomain', 'title');

    ApiResponse.success(res, 'Search completed successfully', projects);
  } catch (error) {
    next(error);
  }
};
