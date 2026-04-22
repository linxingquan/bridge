"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.getMe = exports.login = exports.register = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const express_validator_1 = require("express-validator");
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        const existingUser = await models_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }
        const user = new models_1.User({ email, password });
        await user.save();
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({ token, user: { id: user._id, email: user.email } });
    }
    catch (error) {
        console.log('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        const { email, password } = req.body;
        console.log('Login attempt for:', email);
        console.log('Step 1: Finding user...');
        const user = await models_1.User.findOne({ email });
        console.log('Step 2: User found:', !!user, user?._id);
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        if (!user.isActive) {
            res.status(400).json({ message: 'Account deactivated' });
            return;
        }
        console.log('Generating token for user:', user._id);
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.json({ token, user: { id: user._id, email: user.email } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const user = await models_1.User.findById(req.user?._id).select('-password');
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
exports.getMe = getMe;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await models_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000);
        await user.save();
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
        const resetLink = `${process.env.FRONTEND_URL || 'bridgeapp://'}reset-password/${resetToken}`;
        console.info('Reset link:', resetLink);
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'Reset Your Bridge Password',
            html: `
        <h1>Bridge Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        };
        await transporter.sendMail(mailOptions);
        console.info(`sent to: ${email}, gmail email: ${process.env.GMAIL_EMAIL}, app password: ${process.env.GMAIL_APP_PASSWORD}`);
        res.json({ message: 'Password reset link sent to your email' });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Token required' });
            return;
        }
        const user = await models_1.User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        });
        if (!user) {
            console.info('Invalid or expired token:', token);
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }
        if (!newPassword) {
            res.json({ message: 'Token valid. Please provide new password.' });
            return;
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map