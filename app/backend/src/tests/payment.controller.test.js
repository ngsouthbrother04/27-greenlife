import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as paymentController from '../controllers/payment.controller.js';
import * as momoService from '../services/momo.service.js';
import { StatusCodes } from 'http-status-codes';

vi.mock('../services/momo.service.js');

describe('Payment Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { sub: 1 } };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn()
    };
    next = vi.fn();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('createPayment', () => {
    it('should create payment and return payUrl', async () => {
      req.body = { orderId: 10 };
      const mockResult = { payUrl: 'http://momo.vn/pay' };
      momoService.createMoMoPayment.mockResolvedValue(mockResult);

      await paymentController.createPayment(req, res, next);

      expect(momoService.createMoMoPayment).toHaveBeenCalledWith(10, 1);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockResult
      });
    });

    it('should call next on error', async () => {
      req.body = { orderId: 10 };
      const error = new Error('DB error');
      momoService.createMoMoPayment.mockRejectedValue(error);

      await paymentController.createPayment(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('momoCallback', () => {
    it('should handle MoMo callback successfully', async () => {
      req.body = { signature: 'valid' };
      momoService.handleMoMoCallback.mockResolvedValue({});

      await paymentController.momoCallback(req, res, next);

      expect(momoService.handleMoMoCallback).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 500 on callback error and not call next', async () => {
      req.body = { signature: 'invalid' };
      const error = new Error('Invalid signature');
      momoService.handleMoMoCallback.mockRejectedValue(error);

      await paymentController.momoCallback(req, res, next);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
