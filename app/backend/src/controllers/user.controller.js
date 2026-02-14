import * as userService from '../services/user.service.js';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

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

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const user = await userService.getUserProfile(userId);
    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const user = await userService.updateProfile(userId, req.body);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Profile updated',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Old and new passwords are required');
    }

    await userService.changePassword(userId, oldPassword, newPassword);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Address Controllers
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const addresses = await userService.getAddresses(userId);
    res.status(StatusCodes.OK).json({
      status: 'success',
      results: addresses.length,
      data: { addresses }
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const address = await userService.addAddress(userId, req.body);
    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Address added',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const address = await userService.updateAddress(userId, id, req.body);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Address updated',
      data: { address }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    await userService.deleteAddress(userId, id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Address deleted'
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    await userService.setDefaultAddress(userId, id);
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Set as default address'
    });
  } catch (error) {
    next(error);
  }
};
