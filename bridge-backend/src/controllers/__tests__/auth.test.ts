import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { register, login, getMe } from '../authController';
import { User } from '../../models';
import { AuthRequest } from '../../middleware/auth';

beforeAll(async () => {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/bridge_test';
  await mongoose.connect(url);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Auth Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {
      body: {},
      user: undefined,
    };
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('register', () => {
    it('should reject duplicate email', async () => {
      const existingUser = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      await User.deleteMany({});
      await existingUser.save();

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await register(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Email already registered',
      });
    });

    it('should create new user with valid data', async () => {
      await User.deleteMany({});

      mockRequest.body = {
        email: 'new@example.com',
        password: 'password123',
      };

      await register(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalled();
      const responseData = jsonMock.mock.calls[0][0];
      expect(responseData.token).toBeDefined();
      expect(responseData.user).toBeDefined();
    });
  });

  describe('login', () => {
    it('should reject invalid credentials', async () => {
      await User.deleteMany({});

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid credentials',
      });
    });

    it('should login with correct credentials', async () => {
      await User.deleteMany({});
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();

      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
      const responseData = jsonMock.mock.calls[0][0];
      expect(responseData.token).toBeDefined();
    });
  });

  describe('getMe', () => {
    it('should return user data when authenticated', async () => {
      await User.deleteMany({});
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();
      mockRequest.user = user;

      await getMe(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();
    });

    it('should return 401 when not authenticated', async () => {
      mockRequest.user = undefined;

      await getMe(mockRequest as AuthRequest, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });
});