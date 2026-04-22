import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  updateProfile,
  getProfile,
  deactivateAccount,
  deleteAccount,
  uploadPhoto,
  deletePhoto,
  getSingles,
} from '../controllers/userController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const userId = req.user?._id?.toString() || 'temp';
    const dir = path.join(__dirname, '../../uploads', `${userId}_photos`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req: any, file: any, cb: any) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`);
  },
});

const upload = multer({ storage });

router.put('/profile', authenticate, updateProfile);
router.get('/profile/:userId', authenticate, getProfile);
router.post('/deactivate', authenticate, deactivateAccount);
router.delete('/account', authenticate, deleteAccount);
router.post('/photos', authenticate, upload.single('photo'), uploadPhoto);
router.delete('/photos', authenticate, deletePhoto);
router.get('/singles', authenticate, getSingles);

export default router;