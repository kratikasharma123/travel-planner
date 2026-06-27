import mongoose from 'mongoose';

const travelPreferencesSchema = new mongoose.Schema(
  {
    preferredBudgetRange: {
      type: String,
      trim: true,
      default: '',
    },
    preferredTravelStyle: {
      type: String,
      trim: true,
      default: '',
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
    travelPreferences: {
      type: travelPreferencesSchema,
      default: () => ({}),
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
