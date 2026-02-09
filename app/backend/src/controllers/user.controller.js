import * as userService from '../services/user.service.js';
import { StatusCodes } from 'http-status-codes';

export const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(StatusCodes.OK).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};
