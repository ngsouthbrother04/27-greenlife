import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-it';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Register a new user
 */
export const register = async (userData) => {
  const { fullName, email, password } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      role: 'CUSTOMER' // Default role
    }
  });

  // Remove password from response
  // eslint-disable-next-line no-unused-vars
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Login user
 */
export const login = async (email, password) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect email or password');
  }

  // Generate Token
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // eslint-disable-next-line no-unused-vars
  const { password: _, ...userInfo } = user;

  return {
    accessToken,
    user: userInfo
  };
};

/**
 * Seed Admin Account
 */
export const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456'; // Default

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      await prisma.user.create({
        data: {
          fullName: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Seeded default Admin account');
    }
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
  }
};
