import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { reportUser, blockUser } from '../controllers/chatController';

const router = Router();

router.post('/', authenticate, reportUser);
router.post('/block/:userId', authenticate, blockUser);

export default router;