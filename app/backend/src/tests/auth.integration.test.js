import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import { prisma } from './setup.js';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Clear the User table before tests if using a test database. 
    // Wait, testing against a live dev DB is dangerous. 
    // For now, let's use a unique email to avoid conflict.
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  const uniqueEmail = `test_integration_${Date.now()}@example.com`;
  const password = 'Password123!';

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Integration Test User',
          email: uniqueEmail,
          password: password,
        });

      if (response.status !== 201) {
        console.error(response.body); // For debugging locally
      }
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(uniqueEmail);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Another User',
          email: uniqueEmail, // Same email as above
          password: password,
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: password,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user.email).toBe(uniqueEmail);
    });

    it('should return 401 with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Incorrect email or password');
    });
  });
});
