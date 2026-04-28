import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMessages,
  sendMessage,
} from '../controllers/messageController';

const router = Router();

router.get('/:chatId', authenticate, getMessages);
router.post('/:chatId', authenticate, sendMessage);

export default router;
