"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReaction = exports.markAsRead = exports.sendMessage = exports.getMessages = void 0;
const models_1 = require("../models");
const getMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?._id;
        const match = await models_1.Match.findById(matchId);
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        const isParticipant = match.users.some((u) => u.toString() === userId?.toString());
        if (!isParticipant) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const messages = await models_1.Message.find({ matchId })
            .sort({ createdAt: 1 })
            .populate('senderId', 'profile.name profile.photos');
        await models_1.Message.updateMany({ matchId, senderId: { $ne: userId }, isRead: false }, { isRead: true });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { text, photo } = req.body;
        const senderId = req.user?._id;
        const match = await models_1.Match.findById(matchId);
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        const isParticipant = match.users.some((u) => u.toString() === senderId?.toString());
        if (!isParticipant) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const message = new models_1.Message({
            matchId,
            senderId,
            text,
            photo,
        });
        await message.save();
        const populatedMessage = await models_1.Message.findById(message._id).populate('senderId', 'profile.name profile.photos');
        res.json(populatedMessage);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.sendMessage = sendMessage;
const markAsRead = async (req, res) => {
    try {
        const { matchId, messageId } = req.params;
        const userId = req.user?._id;
        await models_1.Message.findOneAndUpdate({ _id: messageId, matchId, senderId: { $ne: userId } }, { isRead: true });
        res.json({ message: 'Marked as read' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.markAsRead = markAsRead;
const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user?._id;
        const message = await models_1.Message.findById(messageId);
        if (!message) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }
        const existingReaction = message.reactions.findIndex((r) => r.userId.toString() === userId?.toString());
        if (existingReaction >= 0) {
            message.reactions[existingReaction].emoji = emoji;
        }
        else {
            message.reactions.push({ userId: userId, emoji });
        }
        await message.save();
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.addReaction = addReaction;
//# sourceMappingURL=messageController.js.map