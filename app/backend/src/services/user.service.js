import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
