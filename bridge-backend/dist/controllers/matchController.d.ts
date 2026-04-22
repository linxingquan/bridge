import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getMatches: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMatchById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const unmatch: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reportUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const blockUser: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=matchController.d.ts.map