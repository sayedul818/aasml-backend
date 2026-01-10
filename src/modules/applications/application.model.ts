import mongoose, { Schema } from 'mongoose';
import { IApplication } from '../../types';

const applicationSchema = new Schema<IApplication>(
  {
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [100, 'Name must not exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true
    },
    education: {
      type: String,
      required: [true, 'Education is required'],
      trim: true
    },
    institute: {
      type: String,
      required: [true, 'Institute is required'],
      trim: true
    },
    currentStatus: {
      type: String,
      required: [true, 'Current status is required'],
      trim: true
    },
    position: {
      type: String,
      enum: ['PHD', 'MASTERS', 'INTERN', 'POSTDOC', 'RESEARCH_ASSISTANT'],
      required: [true, 'Position is required']
    },
    researchInterest: {
      type: String,
      required: [true, 'Research interest is required'],
      maxlength: [2000, 'Research interest must not exceed 2000 characters']
    },
    cv: {
      type: String,
      required: [true, 'CV is required']
    },
    coverLetter: {
      type: String
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'],
      default: 'PENDING'
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: {
      type: String,
      maxlength: [2000, 'Review notes must not exceed 2000 characters']
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
applicationSchema.index({ email: 1, submittedAt: -1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ position: 1 });

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
