import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMessages,
  sendMessage,
  markAsRead,
  addReaction,
} from '../controllers/messageController';

const router = Router();

router.get('/:matchId', authenticate, getMessages);
router.post('/:matchId', authenticate, sendMessage);
router.put('/:matchId/:messageId/read', authenticate, markAsRead);
router.put('/:matchId/:messageId/reaction', authenticate, addReaction);

export default router;