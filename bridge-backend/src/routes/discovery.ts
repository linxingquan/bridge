import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDiscoveryFeed,
  swipeUser,
  updateFilters,
} from '../controllers/discoveryController';

const router = Router();

router.get('/feed', authenticate, getDiscoveryFeed);
router.post('/swipe', authenticate, swipeUser);
router.put('/filters', authenticate, updateFilters);

export default router;