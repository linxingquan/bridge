"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.deactivateAccount = exports.getProfile = exports.updateProfile = exports.deletePhoto = exports.uploadPhoto = void 0;
const models_1 = require("../models");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadPhoto = async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        const photoUrl = `${baseUrl}/uploads/${userId}_photos/${req.file.filename}`;
        res.json({ url: photoUrl });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.uploadPhoto = uploadPhoto;
const deletePhoto = async (req, res) => {
    try {
        const userId = req.user?._id?.toString();
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ message: 'URL required' });
            return;
        }
        const filename = url.split('/').filter(Boolean).pop();
        const baseDir = path_1.default.join(__dirname, '..', '..');
        const filepath = path_1.default.join(baseDir, 'uploads', `${userId}_photos`, filename);
        console.log('[deletePhoto] UserId:', userId);
        console.log('[deletePhoto] URL:', url);
        console.log('[deletePhoto] Filename:', filename);
        console.log('[deletePhoto] Filepath:', filepath);
        if (fs_1.default.existsSync(filepath)) {
            fs_1.default.unlinkSync(filepath);
            console.log('[deletePhoto] File deleted:', filepath);
        }
        else {
            console.log('[deletePhoto] File not found:', filepath);
        }
        res.json({ message: 'Photo deleted' });
    }
    catch (error) {
        console.error('[deletePhoto] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deletePhoto = deletePhoto;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        const updates = req.body;
        const updateFields = {};
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
        const user = await models_1.User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await models_1.User.findById(userId).select('-password -email -dailyLikes -preferences');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getProfile = getProfile;
const deactivateAccount = async (req, res) => {
    try {
        const userId = req.user?._id;
        await models_1.User.findByIdAndUpdate(userId, { isActive: false });
        res.json({ message: 'Account deactivated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deactivateAccount = deactivateAccount;
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user?._id;
        await models_1.User.findByIdAndDelete(userId);
        res.json({ message: 'Account deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=userController.js.map