import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getMe, forgotPassword, resetPassword } from '../controllers/authController';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 1 }),
  ],
  login
);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', authenticate, getMe);

export default router;