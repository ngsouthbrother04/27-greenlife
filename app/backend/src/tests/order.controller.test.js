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
    req = { user: { sub: 1 }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create COD order successfully without MoMo integration', async () => {
      const mockRequestBody = {
        fullName: 'Test User',
        phone: '123456789',
        email: 'test@example.com',
        address: '123 Street',
        items: [{ productId: 1, quantity: 2, price: 100 }],
        totalAmount: 200,
        paymentMethod: 'COD'
      };
      req.body = mockRequestBody;

      const mockOrder = { id: 100, ...mockRequestBody };
      orderService.createOrder.mockResolvedValue(mockOrder);

      await orderController.createOrder(req, res, next);

      expect(orderService.createOrder).toHaveBeenCalled();
      expect(momoService.createMoMoPayment).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Order created successfully',
        data: { order: mockOrder },
        paymentUrl: null
      });
    });

    it('should create order and call MoMo service if method is MOMO', async () => {
      const mockRequestBody = {
        fullName: 'Test User',
        items: [{ productId: 1, quantity: 1, price: 50 }],
        totalAmount: 50,
        paymentMethod: 'momo'
      };
      req.body = mockRequestBody;

      const mockOrder = { id: 101, total: 50 };
      orderService.createOrder.mockResolvedValue(mockOrder);
      momoService.createMoMoPayment.mockResolvedValue({ payUrl: 'https://momo.com/pay' });

      await orderController.createOrder(req, res, next);

      expect(momoService.createMoMoPayment).toHaveBeenCalledWith(101, 1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        paymentUrl: 'https://momo.com/pay'
      }));
    });
  });

  describe('getMyOrders', () => {
    it('should fetch user orders', async () => {
      const mockResult = {
        orders: [{ id: 1 }],
        pagination: { page: 1, total: 1 }
      };
      orderService.getUserOrders.mockResolvedValue(mockResult);

      await orderController.getMyOrders(req, res, next);

      expect(orderService.getUserOrders).toHaveBeenCalledWith(1, req.query);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        ...mockResult
      });
    });
  });
});
