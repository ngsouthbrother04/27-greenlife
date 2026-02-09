import * as authService from '../services/auth.service.js';
import { StatusCodes } from 'http-status-codes';

export const register = async (req, res, next) => {
  try {
    const newUser = await authService.register(req.body);
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'User registered successfully',
      data: { user: newUser }
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
