import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models';
export interface AuthRequest extends Request {
    user?: IUser;
}
export declare const JWT_SECRET: string;
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const generateToken: (userId: string) => string;
//# sourceMappingURL=auth.d.ts.map