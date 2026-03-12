import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userController from '../controllers/user.controller.js';
import * as userService from '../services/user.service.js';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

vi.mock('../services/user.service.js');

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { sub: 1 }, body: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: 1 }, { id: 2 }];
      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAll(req, res, next);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 2,
        data: { users: mockUsers }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error on failure', async () => {
      const error = new Error('DB Error');
      userService.getAllUsers.mockRejectedValue(error);
      
      await userController.getAll(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateUser', () => {
    it('should update user and return 200', async () => {
      req.params.id = '1';
      req.body = { fullName: 'Updated Name' };
      const mockUser = { id: 1, fullName: 'Updated Name' };
      userService.updateUser.mockResolvedValue(mockUser);

      await userController.updateUser(req, res, next);

      expect(userService.updateUser).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'User updated successfully',
        data: { user: mockUser }
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and return 200', async () => {
      req.params.id = '1';
      userService.deleteUser.mockResolvedValue();

      await userController.deleteUser(req, res, next);

      expect(userService.deleteUser).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
    });
  });

  describe('getProfile', () => {
    it('should get current user profile', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      userService.getUserProfile.mockResolvedValue(mockUser);

      await userController.getProfile(req, res, next);

      expect(userService.getUserProfile).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { user: mockUser }
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile and return updated user', async () => {
      req.body = { fullName: 'New Name' };
      const mockUser = { id: 1, fullName: 'New Name' };
      userService.updateProfile.mockResolvedValue(mockUser);

      await userController.updateProfile(req, res, next);

      expect(userService.updateProfile).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      req.body = { oldPassword: 'old', newPassword: 'new' };
      userService.changePassword.mockResolvedValue();

      await userController.changePassword(req, res, next);

      expect(userService.changePassword).toHaveBeenCalledWith(1, 'old', 'new');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Password updated successfully' }));
    });

    it('should throw BAD_REQUEST if passwords are missing', async () => {
      req.body = { oldPassword: 'old' }; // missing newPassword
      
      await userController.changePassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ApiError));
      const calledError = next.mock.calls[0][0];
      expect(calledError.statusCode).toBe(StatusCodes.BAD_REQUEST);
    });
  });

  describe('Address Controllers', () => {
    it('getAddresses should return user addresses', async () => {
      const mockAddresses = [{ id: 1 }, { id: 2 }];
      userService.getAddresses.mockResolvedValue(mockAddresses);

      await userController.getAddresses(req, res, next);

      expect(userService.getAddresses).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ results: 2, data: { addresses: mockAddresses } }));
    });

    it('addAddress should add new address', async () => {
      req.body = { street: 'Main St' };
      const mockAddress = { id: 1, street: 'Main St' };
      userService.addAddress.mockResolvedValue(mockAddress);

      await userController.addAddress(req, res, next);

      expect(userService.addAddress).toHaveBeenCalledWith(1, req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    });

    it('updateAddress should update existing address', async () => {
      req.params.id = '5';
      req.body = { street: 'New St' };
      const mockAddress = { id: 5, street: 'New St' };
      userService.updateAddress.mockResolvedValue(mockAddress);

      await userController.updateAddress(req, res, next);

      expect(userService.updateAddress).toHaveBeenCalledWith(1, '5', req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('deleteAddress should delete address', async () => {
      req.params.id = '5';
      userService.deleteAddress.mockResolvedValue();

      await userController.deleteAddress(req, res, next);

      expect(userService.deleteAddress).toHaveBeenCalledWith(1, '5');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });

    it('setDefaultAddress should set default', async () => {
      req.params.id = '5';
      userService.setDefaultAddress.mockResolvedValue();

      await userController.setDefaultAddress(req, res, next);

      expect(userService.setDefaultAddress).toHaveBeenCalledWith(1, '5');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });
  });
});
