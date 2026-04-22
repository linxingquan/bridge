import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadPhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePhoto: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deactivateAccount: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteAccount: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map