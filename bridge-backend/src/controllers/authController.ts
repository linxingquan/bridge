import nodemailer from 'nodemailer';
import { Response } from 'express';
import { validationResult } from 'express-validator';
import { User, IUser } from '../models';
import { AuthRequest, generateToken } from '../middleware/auth';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const user = new User({ email, password });
    user.lastLoginTime = new Date();
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.log('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    console.log('Step 1: Finding user...');
    const user = await User.findOne({ email });
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

    user.lastLoginTime = new Date();
    await user.save();

    console.log('Generating token for user:', user._id);
    const token = generateToken(user._id.toString());
    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.resetToken && user.resetTokenExpiry && user.resetTokenExpiry > new Date()) {
      res.json({ message: 'existing_token', info: 'A reset link has already been sent. Please check your email or try again later.' });
      return;
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    const transporter = nodemailer.createTransport({
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
        <p>Copy and paste the link below to the browser in your phone to reset your password:</p>
        <a target="_blank" href="${resetLink}">${resetLink}</a>
        <p>This link expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.info(`sent to: ${email}, gmail email: ${process.env.GMAIL_EMAIL}, app password: ${process.env.GMAIL_APP_PASSWORD}`);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token) {
      res.status(400).json({ message: 'Token required' });
      return;
    }
    
    const user = await User.findOne({
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
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};