import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn()
      }
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

// Mock Dependencies
vi.mock('bcrypt');
vi.mock('jsonwebtoken');

// Import service sau khi đã mock
import { register, login, seedAdmin } from '../services/auth.service.js';

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('JWT_SECRET', 'test-secret');
    vi.stubEnv('JWT_EXPIRES_IN', '1h');
  });

  describe('register', () => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      // Setup mocks
      mockPrisma.user.findUnique.mockResolvedValue(null); // User not exists
      bcrypt.hash.mockResolvedValue('hashed_password');
      
      const createdUser = {
        id: 1,
        fullName: userData.fullName,
        email: userData.email,
        password: 'hashed_password',
        role: 'CUSTOMER'
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);
      jwt.sign.mockReturnValue('mock_token');

      // Execute
      const result = await register(userData);

      // Assertions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email }
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          fullName: userData.fullName,
          email: userData.email,
          password: 'hashed_password',
          role: 'CUSTOMER'
        }
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: 1, role: 'CUSTOMER' },
        'test-secret',
        { expiresIn: '1h' }
      );
      
      // Response check
      expect(result.accessToken).toBe('mock_token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw Conflict error if email exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2, email: userData.email });

      await expect(register(userData)).rejects.toThrow(ApiError);
      try {
        await register(userData);
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.CONFLICT);
        expect(err.message).toBe('Email already exists');
      }
    });
  });

  describe('login', () => {
    const email = 'login@example.com';
    const password = 'password123';

    it('should login successfully and return token and user without password', async () => {
      const dbUser = {
        id: 1,
        email,
        password: 'hashed_password',
        role: 'CUSTOMER'
      };
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mock_login_token');

      const result = await login(email, password);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, 'hashed_password');
      expect(result.accessToken).toBe('mock_login_token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.id).toBe(1);
    });

    it('should throw Unauthorized if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(login(email, password)).rejects.toThrow(ApiError);
      try {
        await login(email, password);
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.UNAUTHORIZED);
        expect(err.message).toBe('Incorrect email or password');
      }
    });

    it('should throw Unauthorized if password does not match', async () => {
      const dbUser = { id: 1, email, password: 'hashed_password' };
      mockPrisma.user.findUnique.mockResolvedValue(dbUser);
      bcrypt.compare.mockResolvedValue(false); // Password mismatch

      await expect(login(email, password)).rejects.toThrow(ApiError);
    });
  });

  describe('seedAdmin', () => {
    it('should seed admin if not exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_admin_pwd');
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await seedAdmin();

      expect(mockPrisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          role: 'ADMIN',
          email: 'admin@gmail.com'
        })
      }));
      expect(consoleSpy).toHaveBeenCalledWith('✅ Seeded default Admin account');
      consoleSpy.mockRestore();
    });

    it('should do nothing if admin already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: 'admin@gmail.com' });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await seedAdmin();

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw Internal Server Error if DB throws', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('DB Error'));

      await expect(seedAdmin()).rejects.toThrow(ApiError);
      try {
        await seedAdmin();
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
        expect(err.message).toBe('Failed to seed admin');
      }
    });
  });
});
