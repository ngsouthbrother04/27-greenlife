import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true
    }
  });
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      addresses: true
    }
  });

  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  return user;
};

/**
 * Update user profile
 */
export const updateProfile = async (userId, data) => {
  const { fullName, phone } = data;

  return await prisma.user.update({
    where: { id: userId },
    data: { fullName, phone },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true
    }
  });
};

/**
 * Change password
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Incorrect old password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return { message: 'Password updated successfully' };
};

/**
 * Get user addresses
 */
export const getAddresses = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' } // Default address first
  });
};

/**
 * Add new address
 */
export const addAddress = async (userId, addressData) => {
  const { receiver, phone, detail, city, isDefault } = addressData;

  // If set to default, unset other default addresses
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }

  // Check if this is the first address, make it default automatically if not specified
  const count = await prisma.address.count({ where: { userId } });
  const shouldBeDefault = isDefault || count === 0;

  return await prisma.address.create({
    data: {
      userId,
      receiver,
      phone,
      detail,
      city,
      isDefault: shouldBeDefault
    }
  });
};

/**
 * Update address
 */
export const updateAddress = async (userId, addressId, addressData) => {
  const { receiver, phone, detail, city, isDefault } = addressData;
  const id = parseInt(addressId);

  const address = await prisma.address.findFirst({
    where: { id, userId }
  });

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, 'Address not found');

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });
  }

  return await prisma.address.update({
    where: { id },
    data: {
      receiver,
      phone,
      detail,
      city,
      isDefault
    }
  });
};

/**
 * Delete address
 */
export const deleteAddress = async (userId, addressId) => {
  const id = parseInt(addressId);
  const address = await prisma.address.findFirst({
    where: { id, userId }
  });

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, 'Address not found');

  await prisma.address.delete({ where: { id } });
  return { message: 'Address deleted' };
};

/**
 * Set default address
 */
export const setDefaultAddress = async (userId, addressId) => {
  const id = parseInt(addressId);
  const address = await prisma.address.findFirst({
    where: { id, userId }
  });

  if (!address) throw new ApiError(StatusCodes.NOT_FOUND, 'Address not found');

  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    }),
    prisma.address.update({
      where: { id },
      data: { isDefault: true }
    })
  ]);

  return { message: 'Set default address successfully' };
};
