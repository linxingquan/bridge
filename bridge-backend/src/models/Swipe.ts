import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISwipe extends Document {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  type: 'like' | 'pass' | 'superlike';
  createdAt: Date;
}

const swipeSchema = new Schema<ISwipe>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'pass', 'superlike'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

swipeSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
swipeSchema.index({ toUserId: 1, createdAt: -1 });

export const Swipe = mongoose.model<ISwipe>('Swipe', swipeSchema);