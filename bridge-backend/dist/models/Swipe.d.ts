import mongoose, { Document, Types } from 'mongoose';
export interface ISwipe extends Document {
    fromUserId: Types.ObjectId;
    toUserId: Types.ObjectId;
    type: 'like' | 'pass' | 'superlike';
    createdAt: Date;
}
export declare const Swipe: mongoose.Model<ISwipe, {}, {}, {}, mongoose.Document<unknown, {}, ISwipe, {}, mongoose.DefaultSchemaOptions> & ISwipe & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISwipe>;
//# sourceMappingURL=Swipe.d.ts.map