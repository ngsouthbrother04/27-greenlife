import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as orderController from '../controllers/order.controller.js';
import * as orderService from '../services/order.service.js';
import * as momoService from '../services/momo.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/order.service.js');
vi.mock('../services/momo.service.js');

describe('Order Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {}, user: { sub: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order without momo', async () => {
      req.body = { shippingAddress: '123 Test St', note: 'Test' };
      const mockOrder = { id: 10 };
      orderService.createOrder.mockResolvedValue(mockOrder);

      await orderController.createOrder(req, res, next);

      expect(orderService.createOrder).toHaveBeenCalledWith(1, '123 Test St', 'Test', undefined, undefined, undefined);
      expect(momoService.createMoMoPayment).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Order created successfully',
        data: { order: mockOrder },
        paymentUrl: null
      });
    });

    it('should create an order with momo payment method', async () => {
      req.body = { paymentMethod: 'MOMO' };
      const mockOrder = { id: 10 };
      orderService.createOrder.mockResolvedValue(mockOrder);
      momoService.createMoMoPayment.mockResolvedValue({ payUrl: 'http://momo.vn/pay' });

      await orderController.createOrder(req, res, next);

      expect(orderService.createOrder).toHaveBeenCalledWith(1, expect.any(Object), undefined, undefined, undefined, 'MOMO');
      expect(momoService.createMoMoPayment).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Order created successfully',
        data: { order: mockOrder },
        paymentUrl: 'http://momo.vn/pay'
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      orderService.createOrder.mockRejectedValue(error);

      await orderController.createOrder(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMyOrders', () => {
    it('should return user orders', async () => {
      const mockResult = { orders: [{ id: 1 }], pagination: {} };
      orderService.getUserOrders.mockResolvedValue(mockResult);

      await orderController.getMyOrders(req, res, next);

      expect(orderService.getUserOrders).toHaveBeenCalledWith(1, req.query);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        ...mockResult
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      orderService.getUserOrders.mockRejectedValue(error);

      await orderController.getMyOrders(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getOrder', () => {
    it('should return a user order by id', async () => {
      req.params.id = '10';
      const mockOrder = { id: 10 };
      orderService.getOrderById.mockResolvedValue(mockOrder);

      await orderController.getOrder(req, res, next);

      expect(orderService.getOrderById).toHaveBeenCalledWith(1, '10');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { order: mockOrder }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      orderService.getOrderById.mockRejectedValue(error);

      await orderController.getOrder(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a user order', async () => {
      req.params.id = '10';
      const mockOrder = { id: 10, status: 'CANCELLED' };
      orderService.cancelOrder.mockResolvedValue(mockOrder);

      await orderController.cancelOrder(req, res, next);

      expect(orderService.cancelOrder).toHaveBeenCalledWith(1, '10');
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Order cancelled successfully',
        data: { order: mockOrder }
      });
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      orderService.cancelOrder.mockRejectedValue(error);

      await orderController.cancelOrder(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
