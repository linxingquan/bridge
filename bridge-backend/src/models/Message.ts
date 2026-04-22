import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  matchId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  photo?: string;
  isRead: boolean;
  reactions: { userId: Types.ObjectId; emoji: string }[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      default: '',
    },
    photo: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ matchId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);