import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyToken, authorize } from '../middlewares/auth.middleware.js';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  describe('verifyToken', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        header: vi.fn(),
      };
      res = {};
      next = vi.fn();
      vi.clearAllMocks();
    });

    it('should throw Unauthorized error if no authorization header is provided', () => {
      req.headers = { authorization: null };

      expect(() => verifyToken(req, res, next)).toThrow(ApiError);
      expect(() => verifyToken(req, res, next)).toThrow('No token provided');
      try {
        verifyToken(req, res, next);
      } catch (e) {
        expect(e.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      }
    });

    it('should throw Unauthorized error if token format is invalid (no Bearer space)', () => {
      req.headers = { authorization: 'Bearer' };

      expect(() => verifyToken(req, res, next)).toThrow(ApiError);
      expect(() => verifyToken(req, res, next)).toThrow('No token provided');
    });

    it('should throw Unauthorized error if token verifies but fails', () => {
      req.headers = { authorization: 'Bearer invalid_token' };
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      expect(() => verifyToken(req, res, next)).toThrow(ApiError);
      expect(() => verifyToken(req, res, next)).toThrow('Invalid or expired token');
    });

    it('should attach decoded user to req and call next if token is valid', () => {
      const decodedData = { sub: 1, role: 'USER' };
      req.headers = { authorization: 'Bearer valid_token' };
      jwt.verify.mockReturnValue(decodedData);

      verifyToken(req, res, next);

      expect(req.user).toEqual(decodedData);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('authorize', () => {
    it('should return a middleware function', () => {
      const middleware = authorize(['ADMIN']);
      expect(typeof middleware).toBe('function');
    });

    it('should call next if user role matches allowed roles', () => {
      const middleware = authorize(['ADMIN']);
      const req = { user: { role: 'ADMIN' } };
      const next = vi.fn();

      middleware(req, {}, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should throw Forbidden error if user role does not match allowed roles', () => {
      const middleware = authorize(['ADMIN']);
      const req = { user: { role: 'CUSTOMER' } };
      const next = vi.fn();

      expect(() => middleware(req, {}, next)).toThrow(ApiError);
      expect(() => middleware(req, {}, next)).toThrow('Access denied');
      try {
        middleware(req, {}, next);
      } catch (e) {
        expect(e.statusCode).toBe(StatusCodes.FORBIDDEN);
      }
    });

    it('should throw Unauthorized error if user is not attached to req', () => {
      const middleware = authorize(['ADMIN']);
      const req = {};
      const next = vi.fn();

      expect(() => middleware(req, {}, next)).toThrow(ApiError);
      expect(() => middleware(req, {}, next)).toThrow('User not authenticated');
      try {
        middleware(req, {}, next);
      } catch (e) {
        expect(e.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      }
    });
  });
});
