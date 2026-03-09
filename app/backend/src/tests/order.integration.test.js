import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../app.js';
import { prisma } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Order Integration Tests', () => {
  let testUserId;
  let testUserToken;
  let testProductId;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        fullName: 'Order Test User',
        email: `order_tester_${Date.now()}@example.com`,
        password: 'hashedpassword',
        role: 'CUSTOMER'
      }
    });
    testUserId = user.id;

    const secret = process.env.JWT_SECRET || 'your-secret-key-change-it';
    testUserToken = jwt.sign(
      { sub: testUserId, role: user.role },
      secret,
      { expiresIn: '1h' }
    );

    const category = await prisma.category.create({
      data: { name: 'Order Cat', slug: `order-cat-${Date.now()}` }
    });

    const product = await prisma.product.create({
      data: {
        name: 'Order Test Product',
        slug: `order-test-product-${Date.now()}`,
        price: 50,
        stock: 100,
        categoryId: category.id,
        status: 'ACTIVE'
      }
    });
    testProductId = product.id;
  });

  describe('POST /api/orders', () => {
    it('should create a COD order and deduct temporary stock', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          fullName: 'Order Tester',
          phone: '0901234567',
          email: 'order@example.com',
          address: '123 Test Ave',
          paymentMethod: 'COD',
          items: [
            { productId: testProductId, quantity: 2, price: 50 }
          ],
          totalAmount: 100
        });

      if (response.status !== 201) {
        console.error('[Create Order Error]', response.body);
      }
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.order.id).toBeDefined();

      // Verify product stock reserved
      const updatedProduct = await prisma.product.findUnique({ where: { id: testProductId } });
      expect(updatedProduct.reservedStock).toBe(2);
    });

    it('should throw Unauthorized if token is missing', async () => {
      const response = await request(app).post('/api/orders').send({});
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/orders', () => {
    it('should fetch the users orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBeGreaterThanOrEqual(1); // Since we just created one
    });
  });
});
