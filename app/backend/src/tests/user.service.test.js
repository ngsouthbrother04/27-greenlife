import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  const mockTransaction = vi.fn(async (items) => {
    const results = [];
    for (const item of items) {
      if (typeof item === 'function') {
        results.push(await item());
      } else if (item && typeof item.then === 'function') {
        results.push(await item);
      }
    }
    return results;
  });

  return {
    mockPrisma: {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      },
      review: {
        deleteMany: vi.fn()
      },
      address: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        count: vi.fn()
      },
      cart: {
        findUnique: vi.fn(),
        delete: vi.fn()
      },
      cartItem: {
        deleteMany: vi.fn()
      },
      order: {
        findMany: vi.fn(),
        delete: vi.fn()
      },
      orderItem: {
        deleteMany: vi.fn()
      },
      payment: {
        deleteMany: vi.fn()
      },
      $transaction: mockTransaction
    }
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function() {
      return mockPrisma;
    }
  };
});

vi.mock('bcrypt');

import * as userService from '../services/user.service.js';

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return a list of users ordered by createdAt desc', async () => {
      const mockUsers = [{ id: 1, email: 'user@example.com' }];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();
      
      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('updateUser', () => {
    it('should update user role', async () => {
      const dbUser = { id: 1, email: 'a@a.com', role: 'ADMIN' };
      mockPrisma.user.update.mockResolvedValue(dbUser);

      const result = await userService.updateUser(1, { role: 'ADMIN' });

      expect(result).toEqual(dbUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { role: 'ADMIN' },
        select: expect.any(Object)
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user and all related data', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 10 });
      mockPrisma.order.findMany.mockResolvedValue([{ id: 100 }, { id: 101 }]);
      mockPrisma.user.delete.mockResolvedValue({ id: 1 });

      const result = await userService.deleteUser(1);

      expect(mockPrisma.review.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockPrisma.address.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      
      expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 10 } });
      expect(mockPrisma.cart.delete).toHaveBeenCalledWith({ where: { id: 10 } });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockPrisma.orderItem.deleteMany).toHaveBeenCalledWith({ where: { orderId: 100 } });
      expect(mockPrisma.payment.deleteMany).toHaveBeenCalledWith({ where: { orderId: 100 } });
      expect(mockPrisma.order.delete).toHaveBeenCalledWith({ where: { id: 100 } });

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual({ id: 1 });
    });

    it('should handle case without cart and orders safely', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.user.delete.mockResolvedValue({ id: 1 });

      await userService.deleteUser(1);

      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.orderItem.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getUserProfile', () => {
    it('should return user Profile', async () => {
      const mockProfile = { id: 1, email: 'a@a.com' };
      mockPrisma.user.findUnique.mockResolvedValue(mockProfile);

      const result = await userService.getUserProfile(1);
      
      expect(result).toEqual(mockProfile);
    });

    it('should throw NOT FOUND if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserProfile(99)).rejects.toThrow(ApiError);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile fields', async () => {
      const updatedUser = { id: 1, fullName: 'New Name', phone: '0123' };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await userService.updateProfile(1, { fullName: 'New Name', phone: '0123' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: { fullName: 'New Name', phone: '0123' }
      }));
      expect(result).toEqual(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: 'old_hashed' });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('new_hashed');

      const result = await userService.changePassword(1, 'oldPw', 'newPw');

      expect(bcrypt.compare).toHaveBeenCalledWith('oldPw', 'old_hashed');
      expect(bcrypt.hash).toHaveBeenCalledWith('newPw', 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'new_hashed' }
      });
      expect(result.message).toBe('Password updated successfully');
    });

    it('should throw BAD REQUEST if old password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, password: 'old_hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(userService.changePassword(1, 'wrong', 'newPw')).rejects.toThrow(ApiError);
    });

    it('should throw NOT FOUND if user not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(userService.changePassword(99, 'wrong', 'newPw')).rejects.toThrow(ApiError);
    });
  });

  describe('Addresses Management', () => {
    it('getAddresses should return address list ordered by isDefault', async () => {
      const mockAddresses = [{ id: 1, isDefault: true }];
      mockPrisma.address.findMany.mockResolvedValue(mockAddresses);

      const result = await userService.getAddresses(1);
      expect(result).toEqual(mockAddresses);
      expect(mockPrisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { isDefault: 'desc' }
      });
    });

    describe('addAddress', () => {
      it('should add address and set default if requested', async () => {
        const payload = { receiver: 'A', city: 'HN', isDefault: true };
        mockPrisma.address.count.mockResolvedValue(1); // not first
        mockPrisma.address.create.mockResolvedValue({ id: 2, ...payload });

        await userService.addAddress(1, payload);

        expect(mockPrisma.address.updateMany).toHaveBeenCalledWith({
          where: { userId: 1, isDefault: true },
          data: { isDefault: false }
        });
        expect(mockPrisma.address.create).toHaveBeenCalledWith({
          data: { userId: 1, ...payload, isDefault: true }
        });
      });

      it('should add address and auto set default if it is the first address', async () => {
        const payload = { receiver: 'A', city: 'HN', isDefault: false };
        mockPrisma.address.count.mockResolvedValue(0); // first address
        
        await userService.addAddress(1, payload);

        expect(mockPrisma.address.updateMany).not.toHaveBeenCalled();
        expect(mockPrisma.address.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ isDefault: true })
        }));
      });
    });

    describe('updateAddress', () => {
      it('should update existing address', async () => {
        const payload = { receiver: 'A', isDefault: false };
        mockPrisma.address.findFirst.mockResolvedValue({ id: 5 });

        await userService.updateAddress(1, 5, payload);

        expect(mockPrisma.address.findFirst).toHaveBeenCalledWith({ where: { id: 5, userId: 1 } });
        expect(mockPrisma.address.update).toHaveBeenCalled();
      });

      it('should throw NOT FOUND if address not found or not belonging to user', async () => {
        mockPrisma.address.findFirst.mockResolvedValue(null);
        await expect(userService.updateAddress(1, 99, {})).rejects.toThrow(ApiError);
      });
    });

    describe('deleteAddress', () => {
      it('should delete address by id and userId', async () => {
        mockPrisma.address.findFirst.mockResolvedValue({ id: 5 });
        
        const result = await userService.deleteAddress(1, 5);

        expect(mockPrisma.address.delete).toHaveBeenCalledWith({ where: { id: 5 } });
        expect(result.message).toBe('Address deleted');
      });

      it('should throw error if address not found', async () => {
        mockPrisma.address.findFirst.mockResolvedValue(null);
        await expect(userService.deleteAddress(1, 99)).rejects.toThrow(ApiError);
      });
    });

    describe('setDefaultAddress', () => {
      it('should unset other defaults and set specific address to default in a transaction', async () => {
        mockPrisma.address.findFirst.mockResolvedValue({ id: 5 });
        mockPrisma.address.updateMany.mockResolvedValue('query1');
        mockPrisma.address.update.mockResolvedValue('query2');
        
        const result = await userService.setDefaultAddress(1, 5);

        expect(mockPrisma.$transaction).toHaveBeenCalled();
        expect(result.message).toBe('Set default address successfully');
      });

      it('should throw error if address not found', async () => {
        mockPrisma.address.findFirst.mockResolvedValue(null);
        await expect(userService.setDefaultAddress(1, 99)).rejects.toThrow(ApiError);
      });
    });
  });
});
