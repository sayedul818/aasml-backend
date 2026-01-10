import mongoose, { Schema } from 'mongoose';
import { IEvent } from '../../types';

const eventSchema = new Schema<IEvent>(
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
      maxlength: [2000, 'Description must not exceed 2000 characters']
    },
    type: {
      type: String,
      enum: ['WORKSHOP', 'SEMINAR', 'CONFERENCE', 'MEETING', 'GUEST_LECTURE', 'OTHER'],
      required: [true, 'Type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    mode: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'HYBRID'],
      required: [true, 'Mode is required']
    },
    registrationLink: {
      type: String,
      trim: true
    },
    maxParticipants: {
      type: Number,
      min: [0, 'Max participants cannot be negative']
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, 'Current participants cannot be negative']
    },
    speakers: [{
      name: {
        type: String,
        required: true
      },
      designation: {
        type: String,
        required: true
      },
      organization: {
        type: String,
        required: true
      },
      photo: String
    }],
    poster: {
      type: String
    },
    images: [{
      type: String
    }],
    agenda: {
      type: String,
      maxlength: [5000, 'Agenda must not exceed 5000 characters']
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
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ startDate: -1 });
eventSchema.index({ type: 1, isActive: 1 });

// Validate endDate is after startDate
eventSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
