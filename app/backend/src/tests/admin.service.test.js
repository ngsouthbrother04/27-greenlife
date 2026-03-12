import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';

// Setup Mock Prisma
const { mockPrisma } = vi.hoisted(() => {
  const mockTransaction = vi.fn(async (cb) => {
    // If it's a callback-based transaction (interactive tx)
    if (typeof cb === 'function') {
      return await cb({
        order: mockPrisma.order,
        product: mockPrisma.product,
        payment: mockPrisma.payment,
        orderItem: mockPrisma.orderItem
      });
    }
    // If it's an array transaction
    return await Promise.all(cb);
  });

  const mockPrismaInstance = {
    user: { count: vi.fn(), findMany: vi.fn() },
    order: { count: vi.fn(), aggregate: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    product: { count: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    orderItem: { groupBy: vi.fn(), deleteMany: vi.fn() },
    payment: { update: vi.fn(), deleteMany: vi.fn() },
    $transaction: mockTransaction
  };

  return { mockPrisma: mockPrismaInstance };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function() {
      return mockPrisma;
    }
  };
});

import * as adminService from '../services/admin.service.js';

describe('Admin Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    beforeEach(() => {
      mockPrisma.user.count.mockResolvedValue(10);
      mockPrisma.order.count.mockResolvedValue(20);
      mockPrisma.product.count.mockResolvedValue(30);
      mockPrisma.order.aggregate.mockResolvedValue({ _sum: { total: 500 } });
      mockPrisma.order.findMany.mockResolvedValue([
        { createdAt: new Date(), total: 100, status: 'COMPLETED' },
        { createdAt: new Date(), total: 200, status: 'PAID', payment: { method: 'MOMO' } }
      ]);
      mockPrisma.user.findMany.mockResolvedValue([{ createdAt: new Date() }]);
      mockPrisma.orderItem.groupBy.mockResolvedValue([{ productId: 1, _sum: { quantity: 5 } }]);
      mockPrisma.product.findUnique.mockResolvedValue({ id: 1, name: 'Product 1' });
    });

    it('should calculate stats for 30d by default', async () => {
      const result = await adminService.getDashboardStats();
      expect(result.totalUsers).toBe(10);
      expect(result.totalOrders).toBe(20);
      expect(result.totalProducts).toBe(30);
      expect(result.totalRevenue).toBe(500);
      expect(result.topProducts).toHaveLength(1);
      expect(result.chartData).toHaveLength(30);
    });

    it('should calculate stats for quarter', async () => {
      const result = await adminService.getDashboardStats('quarter');
      expect(result.chartData).toHaveLength(4);
    });

    it('should calculate stats for year', async () => {
      const result = await adminService.getDashboardStats('year');
      expect(result.chartData).toHaveLength(12);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      mockPrisma.order.findMany.mockResolvedValue([{ id: 1 }]);
      mockPrisma.order.count.mockResolvedValue(1);

      const result = await adminService.getAllOrders({ page: 1, limit: 10, status: 'PENDING' });
      
      expect(result.orders).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'PENDING' }
      }));
    });

    it('should filter by date ranges', async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      await adminService.getAllOrders({ fromDate: '2024-01-01', toDate: '2024-12-31' });

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          createdAt: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-12-31')
          }
        }
      }));
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status and release stock if changing to CANCELLED from PENDING COD', async () => {
      const mockOrder = {
        id: 1, status: 'PENDING', payment: { id: 11, method: 'COD', status: 'PENDING' },
        items: [{ productId: 1, quantity: 2 }]
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: 'CANCELLED' });

      await adminService.updateOrderStatus(1, 'CANCELLED');

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { reservedStock: { decrement: 2 } }
      });
      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: 11 },
        data: { status: 'FAILED' }
      });
    });

    it('should throw NOT FOUND if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(adminService.updateOrderStatus(99, 'PAID')).rejects.toThrow(ApiError);
    });

    it('should convert reservedStock to deducted stock when order status changes to SHIPPING for COD', async () => {
      const mockOrder = {
        id: 1, status: 'PAID', payment: { id: 11, method: 'COD' },
        items: [{ productId: 1, quantity: 2 }]
      };
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      
      await adminService.updateOrderStatus(1, 'SHIPPING');

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          stock: { decrement: 2 },
          reservedStock: { decrement: 2 }
        }
      });
    });
  });

  describe('getOrder', () => {
    it('should return a single order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1 });
      const order = await adminService.getOrder(1);
      expect(order.id).toBe(1);
    });

    it('should throw NOT FOUND if order missing', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(adminService.getOrder(99)).rejects.toThrow(ApiError);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and related dependencies via transaction', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1 });
      
      const result = await adminService.deleteOrder(1);

      expect(mockPrisma.orderItem.deleteMany).toHaveBeenCalledWith({ where: { orderId: 1 } });
      expect(mockPrisma.payment.deleteMany).toHaveBeenCalledWith({ where: { orderId: 1 } });
      expect(mockPrisma.order.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.message).toBe('Order deleted successfully');
    });

    it('should throw NOT FOUND if order missing', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(adminService.deleteOrder(99)).rejects.toThrow(ApiError);
    });
  });
});
