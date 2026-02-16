import * as authService from '../services/auth.service.js';
import { StatusCodes } from 'http-status-codes';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    console.log('DEBUG: Register Result from Service:', result); // Debug log
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
