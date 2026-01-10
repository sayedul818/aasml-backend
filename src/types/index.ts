import { Request } from 'express';
import { Document, Types } from 'mongoose';

// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  MEMBER = 'MEMBER',
  PUBLIC = 'PUBLIC'
}

// User Interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Extended Request with User
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

// Member Interface
export interface IMember extends Document {
  _id: Types.ObjectId;
  name: string;
  role: string;
  designation: string;
  education: string;
  bio: string;
  expertise: string[];
  email: string;
  phone?: string;
  image: string;
  linkedin?: string;
  github?: string;
  googleScholar?: string;
  researchGate?: string;
  isActive: boolean;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Research Domain Interface
export interface IResearch extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  detailedDescription?: string;
  icon: string;
  image?: string;
  applications?: string[];
  tools?: string[];
  color?: string;
  tags: string[];
  relatedPublications: Types.ObjectId[];
  relatedProjects: Types.ObjectId[];
  datasets?: {
    name: string;
    url: string;
    description?: string;
  }[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Project Interface
export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  detailedDescription?: string;
  category?: string;
  status: 'Ongoing' | 'Completed' | 'Upcoming' | 'ONGOING' | 'COMPLETED' | 'UPCOMING';
  startDate: Date;
  endDate?: Date;
  students?: string[];
  supervisor?: string;
  tools?: string[];
  github?: string;
  demo?: string;
  fundingAgency?: string;
  budget?: number;
  teamMembers: Types.ObjectId[];
  researchDomain: Types.ObjectId;
  images: string[];
  documents: {
    name: string;
    url: string;
    type: string;
  }[];
  technologies: string[];
  outcomes?: string[];
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Publication Interface
export interface IPublication extends Document {
  _id: Types.ObjectId;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: 'JOURNAL' | 'CONFERENCE' | 'WORKSHOP' | 'PREPRINT' | 'BOOK_CHAPTER' | 'THESIS';
  abstract: string;
  doi?: string;
  pdfUrl?: string;
  externalLink?: string;
  citations?: number;
  tags: string[];
  researchDomain?: Types.ObjectId;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Event Interface
export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  type: 'WORKSHOP' | 'SEMINAR' | 'CONFERENCE' | 'MEETING' | 'GUEST_LECTURE' | 'OTHER';
  startDate: Date;
  endDate: Date;
  location: string;
  mode: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  registrationLink?: string;
  maxParticipants?: number;
  currentParticipants: number;
  speakers: {
    name: string;
    designation: string;
    organization: string;
    photo?: string;
  }[];
  poster?: string;
  images: string[];
  agenda?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Application Interface
export interface IApplication extends Document {
  _id: Types.ObjectId;
  applicantName: string;
  email: string;
  phone: string;
  education: string;
  institute: string;
  currentStatus: string;
  position: 'PHD' | 'MASTERS' | 'INTERN' | 'POSTDOC' | 'RESEARCH_ASSISTANT';
  researchInterest: string;
  cv: string;
  coverLetter?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';
  reviewedBy?: Types.ObjectId;
  reviewNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
}

// Cloudinary Upload Result
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
}

// API Response
export interface ApiResponseData<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
