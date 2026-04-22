import mongoose, { Document, Types } from 'mongoose';
export interface IMessage extends Document {
    matchId: Types.ObjectId;
    senderId: Types.ObjectId;
    text: string;
    photo?: string;
    isRead: boolean;
    reactions: {
        userId: Types.ObjectId;
        emoji: string;
    }[];
    createdAt: Date;
}
export declare const Message: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, mongoose.DefaultSchemaOptions> & IMessage & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMessage>;
//# sourceMappingURL=Message.d.ts.map