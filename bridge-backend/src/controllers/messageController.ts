import { Response } from 'express';
import { Message, Chat } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    const isParticipant = chat.users.some(
      (u) => u.toString() === userId?.toString()
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'profile.name profile.photos');

    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, isRead: false },
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
    const { chatId } = req.params;
    const { text, photo } = req.body;
    const senderId = req.user?._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    const isParticipant = chat.users.some(
      (u) => u.toString() === senderId?.toString()
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const message = new Message({
      chatId,
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


