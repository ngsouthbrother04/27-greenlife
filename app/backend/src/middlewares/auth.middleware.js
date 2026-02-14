import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

// JWT_SECRET moved to inside function to ensure runtime loading

/**
 * Middleware to verify JWT Access Token
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-it';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // { sub: userId, role: 'ADMIN'/'CUSTOMER' }
    next();
  } catch (error) { // eslint-disable-line no-unused-vars
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired token');
  }
};

/**
 * Middleware to authorize based on User Roles
 * @param {string[]} roles - Array of allowed roles (e.g. ['ADMIN'])
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authenticated');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied');
    }

    next();
  };
};
