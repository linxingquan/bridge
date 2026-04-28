import { Response } from 'express';
import { Chat, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getChats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const chats = await Chat.find({
      users: userId,
    })
      .sort({ createdAt: -1 })
      .populate('users', 'profile.name profile.profilePhoto profile.location');

    const chatList = chats.map((chat: any) => {
      const otherUser: any = chat.users.find(
        (u: any) => u._id.toString() !== userId.toString()
      );
      return {
        chatId: chat._id,
        user: {
          id: otherUser?._id,
          name: otherUser?.profile.name,
          photo: otherUser?.profile.profilePhoto,
          city: otherUser?.profile.location.city,
        },
        matchedAt: chat.createdAt,
      };
    });

    res.json(chatList);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = req.user?._id;

    const chat = await Chat.findById(chatId).populate('users', 'profile.name');

    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }

    const isParticipant = chat.users.some(
      (u) => u._id.toString() === userId?.toString()
    );

    if (!isParticipant) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const otherUser = chat.users.find(
      (u) => u._id.toString() !== userId?.toString()
    );

    res.json({
      chatId: chat._id,
      user: otherUser,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    console.error('Error fetching chat by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const startChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user?._id;

    if (!userId) {
      res.status(400).json({ message: 'User ID required' });
      return;
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      users: { $all: [currentUserId, userId] },
    });

    if (!chat) {
      const otherUser = await User.findById(userId);
      if (!otherUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      chat = new Chat({
        users: [currentUserId, userId],
        name: otherUser.profile.name || 'Chat',
      });
      await chat.save();
    }

    res.json({ chatId: chat._id });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
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

    await Chat.findByIdAndDelete(chatId);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
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
    console.error('Error reporting user:', error);
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
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
