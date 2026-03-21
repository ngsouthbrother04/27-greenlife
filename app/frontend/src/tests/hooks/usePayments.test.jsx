import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { paymentService } from '@/api';
import { useCreatePayment, useVerifyPayment, usePaymentStatus, usePaymentMethods, useRequestRefund } from '../../hooks/usePayments';

vi.mock('@/api', () => ({
  paymentService: {
    createPayment: vi.fn(),
    verifyPayment: vi.fn(),
    getPaymentStatus: vi.fn(),
    getPaymentMethods: vi.fn(),
    requestRefund: vi.fn(),
  }
}));

const originalLocation = window.location;

describe('usePayments hooks', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    
    delete window.location;
    window.location = { href: '' };
  });
  
  afterEach(() => {
    window.location = originalLocation;
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create payment and optionally redirect', async () => {
    paymentService.createPayment.mockResolvedValue({ paymentUrl: 'http://test.com' });
    const { result } = renderHook(() => useCreatePayment(), { wrapper });

    result.current.mutate({ orderId: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(paymentService.createPayment).toHaveBeenCalledWith({ orderId: 1 });
    expect(window.location.href).toBe('http://test.com');
  });

  it('should verify payment', async () => {
    paymentService.verifyPayment.mockResolvedValue({ status: 'success' });
    const { result } = renderHook(() => useVerifyPayment({ transId: 'abc' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(paymentService.verifyPayment).toHaveBeenCalledWith({ transId: 'abc' });
  });

  it('should get payment status', async () => {
    paymentService.getPaymentStatus.mockResolvedValue({ status: 'success' });
    const { result } = renderHook(() => usePaymentStatus('test_id'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(paymentService.getPaymentStatus).toHaveBeenCalledWith('test_id');
  });

  it('should get payment methods', async () => {
    paymentService.getPaymentMethods.mockResolvedValue([]);
    const { result } = renderHook(() => usePaymentMethods(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(paymentService.getPaymentMethods).toHaveBeenCalled();
  });

  it('should request refund', async () => {
    paymentService.requestRefund.mockResolvedValue({ status: 'refunded' });
    const { result } = renderHook(() => useRequestRefund(), { wrapper });

    result.current.mutate({ orderId: 1 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(paymentService.requestRefund).toHaveBeenCalledWith({ orderId: 1 });
  });
});
