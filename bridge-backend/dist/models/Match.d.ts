import mongoose, { Document, Types } from 'mongoose';
export interface IMatch extends Document {
    users: Types.ObjectId[];
    createdAt: Date;
}
export declare const Match: mongoose.Model<IMatch, {}, {}, {}, mongoose.Document<unknown, {}, IMatch, {}, mongoose.DefaultSchemaOptions> & IMatch & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMatch>;
//# sourceMappingURL=Match.d.ts.map