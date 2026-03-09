import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authController from '../controllers/auth.controller.js';
import * as authService from '../services/auth.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/auth.service.js');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return 201 status', async () => {
      req.body = { email: 'test@example.com', password: 'password123', fullName: 'Test Name' };
      const expectedResult = { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' };

      authService.register.mockResolvedValue(expectedResult);

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User registered successfully',
        data: expectedResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if service throws', async () => {
      const error = new Error('Database error');
      authService.register.mockRejectedValue(error);

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login user and return 200 status', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      const expectedResult = { user: { id: 1, email: 'test@example.com' }, accessToken: 'token123' };

      authService.login.mockResolvedValue(expectedResult);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Login successful',
        data: expectedResult
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if login fails', async () => {
      const error = new Error('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
