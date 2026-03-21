import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentService from '../../api/paymentService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: { post: vi.fn() }
}));

describe('api/paymentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create payment', async () => {
    const mockResponse = { data: { payUrl: 'http://momo.vn' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await paymentService.createPayment({ orderId: '123' });
    expect(axiosClient.post).toHaveBeenCalledWith('/payments/momo/create', { orderId: 123 });
    expect(result).toEqual(mockResponse.data);
  });

  it('should get payment methods', async () => {
    const methods = await paymentService.getPaymentMethods();
    expect(methods.length).toBe(2);
    expect(methods[0].id).toBe('momo');
  });
});
