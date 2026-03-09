import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import { prisma } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Product Integration Tests', () => {
  let testUserId;
  let testUserToken;
  let testProductId;

  beforeAll(async () => {
    // 1. Create a mock user
    const user = await prisma.user.create({
      data: {
        fullName: 'Product Test User',
        email: `product_tester_${Date.now()}@example.com`,
        password: 'hashedpassword', // Not testing login here
        role: 'CUSTOMER'
      }
    });
    testUserId = user.id;

    // 2. Generate a token for this user
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-it';
    testUserToken = jwt.sign(
      { sub: testUserId, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

    // 3. Create a unique Category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        slug: `test-cat-${Date.now()}`
      }
    });

    // 4. Create a mock product
    const product = await prisma.product.create({
      data: {
        name: 'Integration Test Product',
        slug: `integration-test-product-${Date.now()}`,
        price: 99.99,
        stock: 10,
        categoryId: category.id,
        status: 'ACTIVE'
      }
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    // Since we are running in dev db, we might want to cleanup test data
    // Careful about cascading deletes
  });

  describe('GET /api/products', () => {
    it('should fetch a list of active products', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.products)).toBe(true);
      expect(response.body.data.products.length).toBeGreaterThan(0);
      expect(response.body.pagination).toBeDefined();
    });

    it('should paginate products', async () => {
      const response = await request(app).get('/api/products?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.products.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 for non-existent product', async () => {
      const response = await request(app).get('/api/products/999999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Product not found');
    });

    it('should fetch existing product by ID', async () => {
      const response = await request(app).get(`/api/products/${testProductId}`);

      expect(response.status).toBe(200);
      expect(response.body.data.product).toBeDefined();
      expect(response.body.data.product.id).toBe(testProductId);
    });
  });

  describe('POST /api/products/:id/reviews', () => {
    it('should failed to review if user has not bought the product', async () => {
      const response = await request(app)
        .post(`/api/products/${testProductId}/reviews`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          rating: 5,
          comment: 'Good product but I did not buy it!'
        });

      // Based on review.service.js logic, it should forbid
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('You must purchase and receive this product to review it');
    });

    it('should add review if user has COMPLETED order with the product', async () => {
      // 1. Create completed order first
      const order = await prisma.order.create({
        data: {
          userId: testUserId,
          total: 99.99,
          status: 'COMPLETED',
          shippingAddress: { address: 'Test str' },
          items: {
            create: [
              {
                productId: testProductId,
                quantity: 1,
                price: 99.99
              }
            ]
          }
        }
      });

      // 2. Perform the review
      const response = await request(app)
        .post(`/api/products/${testProductId}/reviews`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          rating: 4,
          comment: 'Really nice product after trying!'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.review.rating).toBe(4);
      expect(response.body.data.review.comment).toBe('Really nice product after trying!');
    });

    it('should fetch reviews for the product', async () => {
      const response = await request(app).get(`/api/products/${testProductId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.reviews.length).toBeGreaterThan(0);
      expect(response.body.data.reviews[0].comment).toBe('Really nice product after trying!');
    });
  });
});
