import { Response } from 'express';
import { Message, Match } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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

    const messages = await Message.find({ matchId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'profile.name profile.photos');

    await Message.updateMany(
      { matchId, senderId: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { text, photo } = req.body;
    const senderId = req.user?._id;

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    const isParticipant = match.users.some(
      (u) => u.toString() === senderId?.toString()
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const message = new Message({
      matchId,
      senderId,
      text,
      photo,
    });
    await message.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'senderId',
      'profile.name profile.photos'
    );

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { matchId, messageId } = req.params;
    const userId = req.user?._id;

    await Message.findOneAndUpdate(
      { _id: messageId, matchId, senderId: { $ne: userId } },
      { isRead: true }
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addReaction = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user?._id;

    const message = await Message.findById(messageId);
    if (!message) {
      res.status(404).json({ message: 'Message not found' });
      return;
    }

    const existingReaction = message.reactions.findIndex(
      (r) => r.userId.toString() === userId?.toString()
    );

    if (existingReaction >= 0) {
      message.reactions[existingReaction].emoji = emoji;
    } else {
      message.reactions.push({ userId: userId!, emoji });
    }

    await message.save();
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};