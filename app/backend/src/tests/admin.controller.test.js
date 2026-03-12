import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as adminController from '../controllers/admin.controller.js';
import * as adminService from '../services/admin.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/admin.service.js');

describe('Admin Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return stats and 200 status', async () => {
      req.query = { range: '30d' };
      const mockStats = { revenue: 1000, orders: 10, newUsers: 5 };
      adminService.getDashboardStats.mockResolvedValue(mockStats);

      await adminController.getDashboardStats(req, res, next);

      expect(adminService.getDashboardStats).toHaveBeenCalledWith('30d');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { stats: mockStats }
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next on error', async () => {
      const error = new Error('Service error');
      adminService.getDashboardStats.mockRejectedValue(error);

      await adminController.getDashboardStats(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllOrders', () => {
    it('should return paginated orders', async () => {
      req.query = { page: 1 };
      const mockResult = { orders: [{ id: 1 }], pagination: { current: 1 } };
      adminService.getAllOrders.mockResolvedValue(mockResult);

      await adminController.getAllOrders(req, res, next);

      expect(adminService.getAllOrders).toHaveBeenCalledWith({ page: 1 });
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        results: 1,
        data: { orders: mockResult.orders },
        pagination: mockResult.pagination
      });
    });

    it('should call next on error', async () => {
      const error = new Error('Service error');
      adminService.getAllOrders.mockRejectedValue(error);

      await adminController.getAllOrders(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      req.params.id = '1';
      req.body = { status: 'SHIPPING' };
      const mockOrder = { id: 1, status: 'SHIPPING' };
      adminService.updateOrderStatus.mockResolvedValue(mockOrder);

      await adminController.updateOrderStatus(req, res, next);

      expect(adminService.updateOrderStatus).toHaveBeenCalledWith('1', 'SHIPPING');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Order status updated',
        data: { order: mockOrder }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('Service error');
      adminService.updateOrderStatus.mockRejectedValue(error);

      await adminController.updateOrderStatus(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getOrder', () => {
    it('should get a single order', async () => {
      req.params.id = '1';
      const mockOrder = { id: 1 };
      adminService.getOrder.mockResolvedValue(mockOrder);

      await adminController.getOrder(req, res, next);

      expect(adminService.getOrder).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { order: mockOrder }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('Service error');
      adminService.getOrder.mockRejectedValue(error);

      await adminController.getOrder(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order', async () => {
      req.params.id = '1';
      adminService.deleteOrder.mockResolvedValue();

      await adminController.deleteOrder(req, res, next);

      expect(adminService.deleteOrder).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Order deleted successfully'
      });
    });

    it('should call next on error', async () => {
      const error = new Error('Service error');
      adminService.deleteOrder.mockRejectedValue(error);

      await adminController.deleteOrder(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
