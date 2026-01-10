import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Event from './event.model';
import ApiResponse from '../../utils/ApiResponse';
import ApiError from '../../utils/ApiError';
import { AuthRequest } from '../../types';

// Validation schema
const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  type: z.enum(['WORKSHOP', 'SEMINAR', 'CONFERENCE', 'MEETING', 'GUEST_LECTURE', 'OTHER']),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format'
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format'
  }),
  location: z.string().min(1),
  mode: z.enum(['ONLINE', 'OFFLINE', 'HYBRID']),
  registrationLink: z.string().url().optional().or(z.literal('')),
  maxParticipants: z.coerce.number().min(1).optional(),
  speakers: z.array(z.object({
    name: z.string(),
    designation: z.string(),
    organization: z.string(),
    photo: z.string().optional()
  })).optional(),
  poster: z.string().optional(),
  images: z.array(z.string()).optional(),
  agenda: z.string().max(5000).optional().or(z.literal('')),
  isActive: z.boolean().optional()
});

// Get all events
export const getAllEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, mode, upcoming, isActive } = req.query;
    const filter: any = {};

    if (type) filter.type = type;
    if (mode) filter.mode = mode;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (upcoming === 'true') {
      filter.startDate = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    ApiResponse.success(res, 'Events retrieved successfully', events);
  } catch (error) {
    next(error);
  }
};

// Get event by ID
export const getEventById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    ApiResponse.success(res, 'Event retrieved successfully', event);
  } catch (error) {
    next(error);
  }
};

// Create event
export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const validatedData = eventSchema.parse({
      ...req.body,
      poster: files?.poster?.[0]?.path || req.body.poster,
      images: files?.images?.map(f => f.path) || req.body.images
    });

    const event = await Event.create({
      ...validatedData,
      createdBy: req.user?.id
    });

    ApiResponse.created(res, 'Event created successfully', event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Update event
export const updateEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const validatedData = eventSchema.partial().parse({
      ...req.body,
      ...(files?.poster?.[0]?.path ? { poster: files.poster[0].path } : {}),
      ...(files?.images?.length ? { images: files.images.map(f => f.path) } : {})
    });

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, runValidators: true }
    );

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    ApiResponse.success(res, 'Event updated successfully', event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      next(ApiError.badRequest(error.errors[0].message));
    } else {
      next(error);
    }
  }
};

// Delete event
export const deleteEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    ApiResponse.success(res, 'Event deleted successfully');
  } catch (error) {
    next(error);
  }
};

// Register for event
export const registerForEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw ApiError.badRequest('Event is full');
    }

    event.currentParticipants += 1;
    await event.save();

    ApiResponse.success(res, 'Registered for event successfully', event);
  } catch (error) {
    next(error);
  }
};
