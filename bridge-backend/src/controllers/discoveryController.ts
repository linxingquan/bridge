import { Response } from 'express';
import { User, Swipe, Match } from '../models';
import { AuthRequest } from '../middleware/auth';

const DAILY_LIKE_LIMIT = 50;

export const getDiscoveryFeed = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const userPreferences = user.preferences;
    const myLocation = user.profile.location.coordinates;

    const swipedUserIds = await Swipe.find({ fromUserId: user._id }).distinct('toUserId');
    
    const potentialMatches = await User.find({
      _id: { $nin: swipedUserIds, $ne: user._id },
      isActive: true,
      'profile.photos': { $exists: true, $ne: [] },
    })
      .select('profile.name profile.dob profile.gender profile.location profile.photos profile.bio profile.interests')
      .limit(20);

    const feed = potentialMatches.map((u) => ({
      id: u._id,
      name: u.profile.name,
      age: new Date().getFullYear() - new Date(u.profile.dob).getFullYear(),
      distance: calculateDistance(
        myLocation[1],
        myLocation[0],
        u.profile.location.coordinates[1],
        u.profile.location.coordinates[0]
      ),
      photo: u.profile.photos[0],
      bio: u.profile.bio,
      interests: u.profile.interests,
    }));

    res.json(feed);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const swipeUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { toUserId, type } = req.body;
    const fromUserId = req.user?._id;

    if (!fromUserId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (type === 'like' || type === 'superlike') {
      const user = await User.findById(fromUserId);
      if (user) {
        const today = new Date();
        const resetDate = new Date(user.dailyLikes.resetDate);
        if (today.toDateString() !== resetDate.toDateString()) {
          user.dailyLikes.count = 0;
          user.dailyLikes.resetDate = today;
        }

        if (user.dailyLikes.count >= DAILY_LIKE_LIMIT) {
          res.status(429).json({ message: 'Daily like limit reached' });
          return;
        }

        user.dailyLikes.count += 1;
        await user.save();
      }
    }

    const existingSwipe = await Swipe.findOne({
      fromUserId,
      toUserId,
    });

    if (existingSwipe) {
      res.status(400).json({ message: 'Already swiped' });
      return;
    }

    const swipe = new Swipe({
      fromUserId,
      toUserId,
      type,
    });
    await swipe.save();

    const mutualSwipe = await Swipe.findOne({
      fromUserId: toUserId,
      toUserId: fromUserId,
      type: { $in: ['like', 'superlike'] },
    });

    if (mutualSwipe) {
      const match = new Match({
        users: [fromUserId, toUserId],
      });
      await match.save();

      res.json({ matched: true, matchId: match._id });
      return;
    }

    res.json({ matched: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateFilters = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { ageMin, ageMax, maxDistance, distanceUnit } = req.body;

    const updateFields: Record<string, unknown> = {};
    if (ageMin !== undefined) updateFields['preferences.ageMin'] = ageMin;
    if (ageMax !== undefined) updateFields['preferences.ageMax'] = ageMax;
    if (maxDistance !== undefined) updateFields['preferences.maxDistance'] = maxDistance;
    if (distanceUnit !== undefined) updateFields['preferences.distanceUnit'] = distanceUnit;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}