"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../authController");
const models_1 = require("../../models");
describe('Auth Controller', () => {
    let mockRequest;
    let mockResponse;
    let jsonMock;
    let statusMock;
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
            const existingUser = new models_1.User({
                email: 'test@example.com',
                password: 'password123',
            });
            await models_1.User.deleteMany({});
            await existingUser.save();
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            await (0, authController_1.register)(mockRequest, mockResponse);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Email already registered',
            });
        });
        it('should create new user with valid data', async () => {
            await models_1.User.deleteMany({});
            mockRequest.body = {
                email: 'new@example.com',
                password: 'password123',
            };
            await (0, authController_1.register)(mockRequest, mockResponse);
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalled();
            const responseData = jsonMock.mock.calls[0][0];
            expect(responseData.token).toBeDefined();
            expect(responseData.user).toBeDefined();
        });
    });
    describe('login', () => {
        it('should reject invalid credentials', async () => {
            await models_1.User.deleteMany({});
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            await (0, authController_1.login)(mockRequest, mockResponse);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Invalid credentials',
            });
        });
        it('should login with correct credentials', async () => {
            await models_1.User.deleteMany({});
            const user = new models_1.User({
                email: 'test@example.com',
                password: 'password123',
            });
            await user.save();
            mockRequest.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            await (0, authController_1.login)(mockRequest, mockResponse);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalled();
            const responseData = jsonMock.mock.calls[0][0];
            expect(responseData.token).toBeDefined();
        });
    });
    describe('getMe', () => {
        it('should return user data when authenticated', async () => {
            await models_1.User.deleteMany({});
            const user = new models_1.User({
                email: 'test@example.com',
                password: 'password123',
            });
            await user.save();
            mockRequest.user = user;
            await (0, authController_1.getMe)(mockRequest, mockResponse);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalled();
        });
        it('should return 401 when not authenticated', async () => {
            mockRequest.user = undefined;
            await (0, authController_1.getMe)(mockRequest, mockResponse);
            expect(statusMock).toHaveBeenCalledWith(401);
        });
    });
});
//# sourceMappingURL=auth.test.js.map