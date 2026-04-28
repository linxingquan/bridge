import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChat extends Document {
  users: Types.ObjectId[];
  name: string;
  lastMessageTime?: Date;
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    name: {
      type: String,
      required: true,
    },
    lastMessageTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ users: 1, lastMessageTime: -1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
