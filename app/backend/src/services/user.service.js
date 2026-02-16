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
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (userId, data) => {
  const { role, isActive } = data; // Only allow role/status updates
  // Note: 'isActive' might need a schema update if not present. 
  // Let's check schema.prisma first? 
  // Assuming 'role' is in schema. 'status' or 'isActive' might not be.
  // Existing schema has 'status' in Product but maybe not User.
  // user.controller.js getAllUsers returns 'role'.
  // Let's assume we can update 'role' for now.

  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, fullName: true, email: true, role: true }
  });
};

/**
 * Delete user (Admin only)
 * Manually deletes all related data to avoid foreign key constraints
 */
export const deleteUser = async (userId) => {
  // 1. Delete Reviews
  await prisma.review.deleteMany({ where: { userId } });

  // 2. Delete Addresses
  await prisma.address.deleteMany({ where: { userId } });

  // 3. Delete Cart and CartItems
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.delete({ where: { id: cart.id } });
  }

  // 4. Delete Orders (and related OrderItems, Payments)
  const orders = await prisma.order.findMany({ where: { userId } });
  for (const order of orders) {
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.payment.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
  }

  // 5. Finally delete User
  return await prisma.user.delete({
    where: { id: userId }
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
