import mongoose, { Schema } from 'mongoose';
import { IMember } from '../../types';

const memberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must not exceed 100 characters']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'PhD Scholar', 'Masters Student', 'Research Assistant', 'Intern', 'Alumni'],
      trim: true
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true
    },
    education: {
      type: String,
      required: [true, 'Education is required'],
      trim: true
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: [1000, 'Bio must not exceed 1000 characters']
    },
    expertise: [{
      type: String,
      required: true
    }],
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      required: [true, 'Image is required']
    },
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    googleScholar: {
      type: String,
      trim: true
    },
    researchGate: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    joinedDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
memberSchema.index({ email: 1 });
memberSchema.index({ role: 1 });
memberSchema.index({ isActive: 1 });

const Member = mongoose.model<IMember>('Member', memberSchema);

export default Member;
