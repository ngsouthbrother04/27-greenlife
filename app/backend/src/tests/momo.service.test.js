import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError.js';
import axios from 'axios';
import crypto from 'crypto';

const { mockPrisma } = vi.hoisted(() => {
  process.env.MOMO_PARTNER_CODE = 'partner';
  process.env.MOMO_ACCESS_KEY = 'access';
  process.env.MOMO_SECRET_KEY = 'secret';
  process.env.MOMO_REDIRECT_URL = 'redirect';
  process.env.MOMO_IPN_URL = 'ipn';

  const mockTransaction = vi.fn(async (cb) => {
    if (typeof cb === 'function') {
      return await cb({
        payment: mockPrisma.payment,
        order: mockPrisma.order,
        cart: mockPrisma.cart,
        cartItem: mockPrisma.cartItem,
        product: mockPrisma.product
      });
    }
    return await Promise.all(cb);
  });

  return {
    mockPrisma: {
      order: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      payment: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      },
      cart: {
        findUnique: vi.fn()
      },
      cartItem: {
        deleteMany: vi.fn()
      },
      product: {
        update: vi.fn()
      },
      $transaction: mockTransaction
    }
  };
});

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: function () {
      return mockPrisma;
    }
  };
});

vi.mock('axios');

import * as momoService from '../services/momo.service.js';

describe('MoMo Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('MOMO_PARTNER_CODE', 'partner');
    vi.stubEnv('MOMO_ACCESS_KEY', 'access');
    vi.stubEnv('MOMO_SECRET_KEY', 'secret');
    vi.stubEnv('MOMO_REDIRECT_URL', 'redirect');
    vi.stubEnv('MOMO_IPN_URL', 'ipn');
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  describe('createMoMoPayment', () => {
    it('should throw NOT FOUND if order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(momoService.createMoMoPayment(1, 1)).rejects.toThrow(ApiError);
    });

    it('should throw FORBIDDEN if order does not belong to user', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1, userId: 2 });
      await expect(momoService.createMoMoPayment(1, 1)).rejects.toThrow(ApiError);
    });

    it('should create payment record if not exists, then call MoMo API', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1, userId: 1, total: 50000 });
      mockPrisma.payment.findUnique.mockResolvedValue(null);
      axios.post.mockResolvedValue({ data: { payUrl: 'http://momo.vn/pay' } });

      const result = await momoService.createMoMoPayment(1, 1);

      expect(mockPrisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ method: 'MOMO', amount: 50000 })
      }));
      expect(axios.post).toHaveBeenCalled();
      expect(result.payUrl).toBe('http://momo.vn/pay');
    });

    it('should reuse existing payment record, then call MoMo API', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1, userId: 1, total: 50000 });
      mockPrisma.payment.findUnique.mockResolvedValue({ id: 10 });
      axios.post.mockResolvedValue({ data: { payUrl: 'http://momo.vn/pay' } });

      await momoService.createMoMoPayment(1, 1);

      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
    });

    it('should throw BAD GATEWAY if MoMo API fails', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 1, userId: 1, total: 50000 });
      mockPrisma.payment.findUnique.mockResolvedValue({ id: 10 });
      axios.post.mockRejectedValue(new Error('MoMo failed'));

      await expect(momoService.createMoMoPayment(1, 1)).rejects.toThrow(ApiError);
      try {
        await momoService.createMoMoPayment(1, 1);
      } catch (err) {
        expect(err.statusCode).toBe(StatusCodes.BAD_GATEWAY);
      }
    });
  });

  describe('handleMoMoCallback', () => {
    const createSignature = (data) => {
      const rawSignature = `accessKey=access&amount=${data.amount}&extraData=&message=${data.message}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}&resultCode=${data.resultCode}&transId=${data.transId}`;
      return crypto.createHmac('sha256', 'secret').update(rawSignature).digest('hex');
    };

    it('should throw BAD REQUEST if signature is invalid', async () => {
      const payload = { signature: 'invalid' };
      await expect(momoService.handleMoMoCallback(payload)).rejects.toThrow(ApiError);
    });

    it('should handle successful payment (resultCode 0)', async () => {
      const payload = {
        partnerCode: 'partner', orderId: 'id', requestId: '1-123', amount: 500,
        orderInfo: 'info', orderType: 'type', transId: 'trans123',
        resultCode: 0, message: 'Success', payType: 'web', responseTime: 1234, extraData: ''
      };
      payload.signature = createSignature(payload);

      mockPrisma.order.update.mockResolvedValue({ id: 1, userId: 10, items: [{ productId: 5, quantity: 2 }] });
      mockPrisma.cart.findUnique.mockResolvedValue({ id: 20 });

      const result = await momoService.handleMoMoCallback(payload);

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { orderId: 1 },
        data: expect.objectContaining({ status: 'SUCCESS' })
      }));
      expect(mockPrisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: { status: 'PAID' }
      }));
      expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({ where: { userId: 10 } });
      expect(mockPrisma.cartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId: 20 } });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { stock: { decrement: 2 }, reservedStock: { decrement: 2 } }
      });
      expect(result.message).toBe('Callback received');
    });

    it('should handle failed payment (resultCode != 0)', async () => {
      const payload = {
        partnerCode: 'partner', orderId: 'id', requestId: '1-123', amount: 500,
        orderInfo: 'info', orderType: 'type', transId: 'trans123',
        resultCode: 1006, message: 'Failed', payType: 'web', responseTime: 1234, extraData: ''
      };
      payload.signature = createSignature(payload);

      mockPrisma.order.update.mockResolvedValue({ id: 1, userId: 10, items: [{ productId: 5, quantity: 2 }] });

      await momoService.handleMoMoCallback(payload);

      expect(mockPrisma.payment.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { orderId: 1 },
        data: { status: 'FAILED' }
      }));
      expect(mockPrisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CANCELLED' },
        include: { items: true }
      });
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { reservedStock: { decrement: 2 } } // Only reserved is returned
      });
    });
  });
});
