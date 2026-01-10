import mongoose, { Schema } from 'mongoose';
import { IResearch } from '../../types';

const researchSchema = new Schema<IResearch>(
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
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    detailedDescription: {
      type: String,
      maxlength: [5000, 'Detailed description must not exceed 5000 characters']
    },
    icon: {
      type: String,
      required: [true, 'Icon is required']
    },
    image: {
      type: String
    },
    applications: [{
      type: String
    }],
    tools: [{
      type: String
    }],
    color: {
      type: String,
      default: 'from-neon-blue to-primary'
    },
    tags: [{
      type: String
    }],
    relatedPublications: [{
      type: Schema.Types.ObjectId,
      ref: 'Publication'
    }],
    relatedProjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
    datasets: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      description: String
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
researchSchema.index({ title: 'text', description: 'text', tags: 'text' });
researchSchema.index({ isActive: 1 });

const Research = mongoose.model<IResearch>('Research', researchSchema);

export default Research;
