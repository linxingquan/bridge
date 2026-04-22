import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatch extends Document {
  users: Types.ObjectId[];
  createdAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

matchSchema.index({ users: 1 });

export const Match = mongoose.model<IMatch>('Match', matchSchema);