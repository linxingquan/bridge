import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  profile: {
    name: string;
    dob: Date;
    gender: 'man' | 'woman' | 'other';
    preferredGender: 'man' | 'woman' | 'everyone';
    location: {
      city: string;
      coordinates: [number, number];
    };
    photos: string[];
    profilePhoto: string;
    bio: string;
    interests: string[];
    prompts: { question: string; answer: string }[];
    height: string;
    education: string;
    relationshipGoal: 'casual' | 'serious' | 'dont_know';
  };
  preferences: {
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    distanceUnit: 'km' | 'miles';
  };
  dailyLikes: {
    count: number;
    resetDate: Date;
  };
  isActive: boolean;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true, // This creates a unique index
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profile: {
      name: { type: String, default: '' },
      dob: { type: Date },
      gender: {
        type: String,
        enum: ['man', 'woman', 'other'],
        default: 'man',
      },
      preferredGender: {
        type: String,
        enum: ['man', 'woman', 'everyone'],
        default: 'everyone',
      },
      location: {
        city: { type: String, default: '' },
        coordinates: { type: [Number], default: [0, 0] },
      },
      photos: [{ type: String }],
      profilePhoto: { type: String, default: '' },
      bio: { type: String, default: '' },
      interests: [{ type: String }],
      prompts: [
        {
          question: { type: String },
          answer: { type: String },
        },
      ],
      height: { type: String, default: '' },
      education: { type: String, default: '' },
      relationshipGoal: {
        type: String,
        enum: ['casual', 'serious', 'dont_know'],
        default: 'dont_know',
      },
    },
    preferences: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 50 },
      maxDistance: { type: Number, default: 50 },
      distanceUnit: { type: String, enum: ['km', 'miles'], default: 'km' },
    },
    dailyLikes: {
      count: { type: Number, default: 0 },
      resetDate: { type: Date, default: Date.now },
    },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String, unique: true, sparse: true },
    resetTokenExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);