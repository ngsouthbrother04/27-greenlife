import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

const { mockPrisma } = vi.hoisted(() => {
  const mockTransaction = vi.fn(async (cb) => {
    if (typeof cb === 'function') {
      return await cb({
        order: mockPrisma.order,
        orderItem: mockPrisma.orderItem,
        payment: mockPrisma.payment,
        product: mockPrisma.product,
        cart: mockPrisma.cart,
        cartItem: mockPrisma.cartItem
      });
    }
    return await Promise.all(cb);
  });

  return {
    mockPrisma: {
      product: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      cart: {
        findUnique: vi.fn(),
        delete: vi.fn()
      },
      cartItem: {
        deleteMany: vi.fn()
      },
      order: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
      },
      orderItem: {
        create: vi.fn()
      },
      payment: {
        create: vi.fn()
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

import * as orderService from '../services/order.service.js';

describe('Order Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    const userId = 1;
    const shippingAddress = '123 Fake St';
    const note = 'Test';

    it('should create order from provided items successfully', async () => {
      const items = [{ productId: 10, quantity: 2 }];
      mockPrisma.product.findUnique.mockResolvedValue({ id: 10, price: 100, stock: 10, reservedStock: 0 });
      mockPrisma.order.create.mockResolvedValue({ id: 100 });
      mockPrisma.order.findUnique.mockResolvedValue({ id: 100, userId: 1 }); // Required by getOrderById at the end

      const result = await orderService.createOrder(userId, shippingAddress, note, items, null, 'COD');
      
      expect(result.id).toBe(100);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(mockPrisma.order.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ 
          total: 200, 
          status: 'PENDING', 
          userId: 1,
          shippingAddress: { detail: '123 Fake St' },
          note: 'Test'
        })
      }));
      expect(mockPrisma.orderItem.create).toHaveBeenCalled();
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ method: 'COD' })
      }));
      expect(mockPrisma.product.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 10 },
        data: { reservedStock: { increment: 2 } }
      }));
    });

    it('should throw BAD_REQUEST if product is out of stock in frontend items', async () => {
      const items = [{ productId: 10, quantity: 2 }];
      mockPrisma.product.findUnique.mockResolvedValue({ id: 10, price: 100, stock: 1, reservedStock: 0 });

      await expect(orderService.createOrder(userId, shippingAddress, note, items)).rejects.toThrow(ApiError);
    });

    it('should throw BAD_REQUEST if product not found in frontend items', async () => {
      const items = [{ productId: 10, quantity: 2 }];
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(orderService.createOrder(userId, shippingAddress, note, items)).rejects.toThrow(ApiError);
    });

    it('should create order from existing backend cart successfully', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 5,
        items: [{ productId: 10, quantity: 2, product: { name: 'A', price: 100, stock: 10, reservedStock: 0 } }]
      });
      mockPrisma.order.create.mockResolvedValue({ id: 100 });
      mockPrisma.order.findUnique.mockResolvedValue({ id: 100, userId: 1 });

      const result = await orderService.createOrder(userId, shippingAddress, note, null, null, 'MOMO');
      
      expect(result.id).toBe(100);
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ method: 'MOMO' })
      }));
      // Cart items should NOT be deleted if method is MOMO
      expect(mockPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete cart items if method is COD when using backend cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 5,
        items: [{ productId: 10, quantity: 2, product: { name: 'A', price: 100, stock: 10, reservedStock: 0 } }]
      });
      mockPrisma.order.create.mockResolvedValue({ id: 100 });
      mockPrisma.order.findUnique.mockResolvedValue({ id: 100, userId: 1 });

      await orderService.createOrder(userId, shippingAddress, note, null, null, 'COD');
      
      // Should delete cart
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 5 } });
    });

    it('should throw BAD_REQUEST if backend cart is empty', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 5, items: [] });
      await expect(orderService.createOrder(userId, shippingAddress, note, null, null, 'COD')).rejects.toThrow(ApiError);
    });

    it('should throw BAD_REQUEST if product out of stock in backend cart', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 5,
        items: [{ productId: 10, quantity: 2, product: { name: 'A', price: 100, stock: 1, reservedStock: 0 } }]
      });
      
      await expect(orderService.createOrder(userId, shippingAddress, note, null, null, 'COD')).rejects.toThrow(ApiError);
    });
  });

  describe('getUserOrders', () => {
    it('should return paginated user orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await orderService.getUserOrders(1, { page: 1, limit: 10, status: 'PENDING' });
      expect(result.orders).toHaveLength(1);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 1, status: 'PENDING' }
      }));
    });
  });

  describe('getOrderById', () => {
    it('should return order if user owns it', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      const result = await orderService.getOrderById(1, 1);
      expect(result.id).toBe(1);
    });

    it('should throw FORBIDDEN if user does not own the order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1, userId: 2 });
      await expect(orderService.getOrderById(1, 1)).rejects.toThrow(ApiError);
    });

    it('should throw NOT FOUND if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(orderService.getOrderById(1, 99)).rejects.toThrow(ApiError);
    });
  });

  describe('cancelOrder', () => {
    const userId = 1;
    const orderId = 100;

    it('should cancel PENDING order and decrement reserved stock', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: orderId, userId, status: 'PENDING' });
      mockPrisma.order.update.mockResolvedValue({ id: orderId, items: [{ productId: 10, quantity: 2 }] });

      const result = await orderService.cancelOrder(userId, orderId);
      
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: { items: true }
      });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { reservedStock: { decrement: 2 } }
      });
    });

    it('should throw BAD_REQUEST if order is not PENDING', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: orderId, userId, status: 'SHIPPING' });
      await expect(orderService.cancelOrder(userId, orderId)).rejects.toThrow(ApiError);
    });

    it('should throw FORBIDDEN if user does not own order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: orderId, userId: 2, status: 'PENDING' });
      await expect(orderService.cancelOrder(userId, orderId)).rejects.toThrow(ApiError);
    });

    it('should throw NOT FOUND if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(orderService.cancelOrder(userId, 99)).rejects.toThrow(ApiError);
    });
  });
});
