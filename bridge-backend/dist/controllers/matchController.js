"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = exports.reportUser = exports.unmatch = exports.getMatchById = exports.getMatches = void 0;
const models_1 = require("../models");
const getMatches = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const matches = await models_1.Match.find({
            users: userId,
        })
            .sort({ createdAt: -1 })
            .populate('users', 'profile.name profile.photos profile.location');
        const matchList = matches.map((match) => {
            const otherUser = match.users.find((u) => u._id.toString() !== userId.toString());
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMatches = getMatches;
const getMatchById = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user?._id;
        const match = await models_1.Match.findById(matchId).populate('users', 'profile.name profile.photos');
        if (!match) {
            res.status(404).json({ message: 'Match not found' });
            return;
        }
        const isParticipant = match.users.some((u) => u._id.toString() === userId?.toString());
        if (!isParticipant) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }
        const otherUser = match.users.find((u) => u._id.toString() !== userId?.toString());
        res.json({
            matchId: match._id,
            user: otherUser,
            createdAt: match.createdAt,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMatchById = getMatchById;
const unmatch = async (req, res) => {
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
        await models_1.Match.findByIdAndDelete(matchId);
        res.json({ message: 'Unmatched successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.unmatch = unmatch;
const reportUser = async (req, res) => {
    try {
        const { userId, reason } = req.body;
        const reporterId = req.user?._id;
        console.log(`Report: User ${reporterId} reported user ${userId} for ${reason}`);
        res.json({ message: 'Report submitted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.reportUser = reportUser;
const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const blockerId = req.user?._id;
        console.log(`Block: User ${blockerId} blocked user ${userId}`);
        res.json({ message: 'User blocked' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.blockUser = blockUser;
//# sourceMappingURL=matchController.js.map