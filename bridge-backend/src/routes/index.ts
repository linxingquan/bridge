import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import discoveryRoutes from './discovery';
import chatRoutes from './chats';
import messageRoutes from './messages';
import reportRoutes from './reports';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/reports', reportRoutes);

export default router;
