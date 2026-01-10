import mongoose, { Schema } from 'mongoose';
import { IProject } from '../../types';

const projectSchema = new Schema<IProject>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description must not exceed 1000 characters']
    },
    detailedDescription: {
      type: String,
      maxlength: [10000, 'Detailed description must not exceed 10000 characters']
    },
    category: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Ongoing', 'Completed', 'Upcoming'],
      default: 'Ongoing',
      required: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date
    },
    students: [{
      type: String
    }],
    supervisor: {
      type: String,
      trim: true
    },
    tools: [{
      type: String
    }],
    github: {
      type: String,
      trim: true
    },
    demo: {
      type: String,
      trim: true
    },
    fundingAgency: {
      type: String,
      trim: true
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    teamMembers: [{
      type: Schema.Types.ObjectId,
      ref: 'Member'
    }],
    researchDomain: {
      type: Schema.Types.ObjectId,
      ref: 'Research'
    },
    images: [{
      type: String
    }],
    documents: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      }
    }],
    technologies: [{
      type: String
    }],
    outcomes: [{
      type: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });
projectSchema.index({ status: 1, isActive: 1 });
projectSchema.index({ researchDomain: 1 });

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project;
