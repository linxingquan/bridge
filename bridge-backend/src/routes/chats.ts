import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getChats,
  getChatById,
  deleteChat,
  startChat,
} from '../controllers/chatController';

const router = Router();

router.get('/', authenticate, getChats);
router.post('/', authenticate, startChat);
router.get('/:chatId', authenticate, getChatById);
router.delete('/:chatId', authenticate, deleteChat);

export default router;
