import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMatches,
  getMatchById,
  unmatch,
} from '../controllers/matchController';

const router = Router();

router.get('/', authenticate, getMatches);
router.get('/:matchId', authenticate, getMatchById);
router.delete('/:matchId', authenticate, unmatch);

export default router;