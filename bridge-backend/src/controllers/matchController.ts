import { Response } from 'express';
import { Match, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getMatches = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const matches = await Match.find({
      users: userId,
    })
      .sort({ createdAt: -1 })
      .populate('users', 'profile.name profile.photos profile.location');

    const matchList = matches.map((match: any) => {
      const otherUser: any = match.users.find(
        (u: any) => u._id.toString() !== userId.toString()
      );
      return {
        matchId: match._id,
        user: {
          id: otherUser?._id,
          name: otherUser?.profile.name,
          photo: otherUser?.profile.photos[0],
          city: otherUser?.profile.location.city,
        },
        matchedAt: match.createdAt,
      };
    });

    res.json(matchList);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMatchById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const userId = req.user?._id;

    const match = await Match.findById(matchId).populate('users', 'profile.name profile.photos');

    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    const isParticipant = match.users.some(
      (u) => u._id.toString() === userId?.toString()
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const otherUser = match.users.find(
      (u) => u._id.toString() !== userId?.toString()
    );

    res.json({
      matchId: match._id,
      user: otherUser,
      createdAt: match.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const unmatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matchId } = req.params;
    const userId = req.user?._id;

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    const isParticipant = match.users.some(
      (u) => u.toString() === userId?.toString()
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    await Match.findByIdAndDelete(matchId);
    res.json({ message: 'Unmatched successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const reportUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, reason } = req.body;
    const reporterId = req.user?._id;

    console.log(`Report: User ${reporterId} reported user ${userId} for ${reason}`);

    res.json({ message: 'Report submitted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const blockUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const blockerId = req.user?._id;

    console.log(`Block: User ${blockerId} blocked user ${userId}`);

    res.json({ message: 'User blocked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};