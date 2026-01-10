import mongoose, { Schema } from 'mongoose';
import { IPublication } from '../../types';

const publicationSchema = new Schema<IPublication>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title must not exceed 300 characters']
    },
    authors: [{
      type: String,
      required: [true, 'At least one author is required']
    }],
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    type: {
      type: String,
      enum: ['JOURNAL', 'CONFERENCE', 'WORKSHOP', 'PREPRINT', 'BOOK_CHAPTER', 'THESIS'],
      required: [true, 'Type is required']
    },
    abstract: {
      type: String,
      required: [true, 'Abstract is required'],
      maxlength: [5000, 'Abstract must not exceed 5000 characters']
    },
    doi: {
      type: String,
      trim: true
    },
    pdfUrl: {
      type: String,
      trim: true
    },
    externalLink: {
      type: String,
      trim: true
    },
    citations: {
      type: Number,
      min: [0, 'Citations cannot be negative'],
      default: 0
    },
    tags: [{
      type: String
    }],
    researchDomain: {
      type: Schema.Types.ObjectId,
      ref: 'Research'
    },
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
publicationSchema.index({ title: 'text', abstract: 'text', tags: 'text' });
publicationSchema.index({ year: -1 });
publicationSchema.index({ type: 1, isActive: 1 });
publicationSchema.index({ researchDomain: 1 });

const Publication = mongoose.model<IPublication>('Publication', publicationSchema);

export default Publication;
