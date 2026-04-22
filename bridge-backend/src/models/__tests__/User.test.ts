import mongoose from 'mongoose';
import { User, IUser } from '../User';

beforeAll(async () => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridge_test';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Model', () => {
  describe('User schema validation', () => {
    it('should require email', () => {
      const user = new User({ password: 'password123' });
      const error = user.validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('should require password with min length', () => {
      const user = new User({ email: 'test@example.com', password: 'short' });
      const error = user.validateSync();
      expect(error?.errors.password).toBeDefined();
    });

    it('should accept valid user', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      const error = user.validateSync();
      expect(error).toBeUndefined();
    });

    it('should lowercase email', () => {
      const user = new User({
        email: 'TEST@EXAMPLE.COM',
        password: 'password123',
      });
      expect(user.email).toBe('test@example.com');
    });

    it('should hash password on save', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();
      expect(user.password).not.toBe('password123');
      expect(user.password).toContain('$');
    });

    it('should set default values', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(user.isActive).toBe(true);
      expect(user.profile.name).toBe('');
      expect(user.preferences.ageMin).toBe(18);
      expect(user.preferences.maxDistance).toBe(50);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();
      const result = await user.comparePassword('password123');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();
      const result = await user.comparePassword('wrongpassword');
      expect(result).toBe(false);
    });
  });
});