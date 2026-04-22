import { Response } from 'express';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

export const uploadPhoto = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const photoUrl = `${baseUrl}/uploads/${userId}_photos/${req.file.filename}`;
    res.json({ url: photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deletePhoto = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id?.toString();
    const { url } = req.body;

    if (!url) {
      res.status(400).json({ message: 'URL required' });
      return;
    }

    const filename = url.split('/').filter(Boolean).pop();
    const baseDir = path.join(__dirname, '..', '..');
    const filepath = path.join(baseDir, 'uploads', `${userId}_photos`, filename);

    console.log('[deletePhoto] UserId:', userId);
    console.log('[deletePhoto] URL:', url);
    console.log('[deletePhoto] Filename:', filename);
    console.log('[deletePhoto] Filepath:', filepath);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log('[deletePhoto] File deleted:', filepath);
    } else {
      console.log('[deletePhoto] File not found:', filepath);
    }

    res.json({ message: 'Photo deleted' });
  } catch (error) {
    console.error('[deletePhoto] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const updates = req.body;

    const updateFields: Record<string, unknown> = {};
    if (updates.profile) {
      Object.keys(updates.profile).forEach((key) => {
        updateFields[`profile.${key}`] = updates.profile[key];
      });
    }
    if (updates.preferences) {
      Object.keys(updates.preferences).forEach((key) => {
        updateFields[`preferences.${key}`] = updates.preferences[key];
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      '-password -email -dailyLikes -preferences'
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deactivateAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    await User.findByIdAndUpdate(userId, { isActive: false });
    res.json({ message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAccount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSingles = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const currentUserId = req.user?._id;

    const users = await User.find({
      _id: { $ne: currentUserId },
      isActive: true,
      'profile.photos.0': { $exists: true },
    })
      .select('profile.name profile.dob profile.gender profile.profilePhoto profile.photos profile.bio profile.interests profile.location profile.height profile.education')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments({
      _id: { $ne: currentUserId },
      isActive: true,
      'profile.photos.0': { $exists: true },
    });

    const singles = users.map((user) => {
      const age = user.profile.dob
        ? Math.floor((new Date().getTime() - new Date(user.profile.dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

      return {
        id: user._id.toString(),
        name: user.profile.name || 'Anonymous',
        age,
        gender: user.profile.gender || 'other',
        profilePhoto: user.profile.profilePhoto || (user.profile.photos?.[0] || ''),
        photos: user.profile.photos || [],
        bio: user.profile.bio || '',
        interests: user.profile.interests || [],
        location: user.profile.location?.city || '',
        height: user.profile.height || '',
        education: user.profile.education || '',
      };
    });
    console.info(`[getSingles] Page: ${page}, Limit: ${limit}, Returned: ${singles.length}, Total: ${total}`);
    res.json({
      singles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getSingles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};