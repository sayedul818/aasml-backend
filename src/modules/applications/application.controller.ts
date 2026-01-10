import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Application from './application.model';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Validation schema
const applicationSchema = z.object({
  applicantName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10),
  education: z.string(),
  institute: z.string(),
  currentStatus: z.string(),
  position: z.enum(['PHD', 'MASTERS', 'INTERN', 'POSTDOC', 'RESEARCH_ASSISTANT']),
  researchInterest: z.string().min(10).max(1000),
  cv: z.string(),
  coverLetter: z.string().optional()
});

// Get all applications (Admin/Faculty only)
export const getAllApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, position } = req.query;
    const filter: any = {};

    if (status) filter.status = status;
    if (position) filter.position = position;

    const applications = await Application.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ submittedAt: -1 });

    ApiResponse.success(res, 'Applications retrieved successfully', applications);
  } catch (error) {
    next(error);
  }
};

// Get application by ID
export const getApplicationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('reviewedBy', 'name email');

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    ApiResponse.success(res, 'Application retrieved successfully', application);
  } catch (error) {
    next(error);
  }
};

// Submit application (Public)
export const submitApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const validatedData = applicationSchema.parse({
      ...req.body,
      cv: files?.cv?.[0]?.path || req.body.cv,
      coverLetter: files?.coverLetter?.[0]?.path || req.body.coverLetter
    });

    const application = await Application.create(validatedData);

    ApiResponse.created(res, 'Application submitted successfully', application);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Update application status
export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, reviewNotes } = req.body;

    if (!status) {
      throw ApiError.badRequest('Status is required');
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes,
        reviewedBy: req.user?.id,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    ApiResponse.success(res, 'Application status updated successfully', application);
  } catch (error) {
    next(error);
  }
};

// Delete application
export const deleteApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      throw ApiError.notFound('Application not found');
    }

    ApiResponse.success(res, 'Application deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Get application statistics
export const getApplicationStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments();

    ApiResponse.success(res, 'Application statistics retrieved successfully', {
      stats,
      total: totalApplications
    });
  } catch (error) {
    next(error);
  }
};
