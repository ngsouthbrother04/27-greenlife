import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from '@/api';
import { useCreateOrder, useOrders, useOrder, useUpdateOrderStatus, useCancelOrder, useMyOrders } from '../../hooks/useOrders';

vi.mock('@/api', () => ({
  orderService: {
    createOrder: vi.fn(),
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    updateOrderStatus: vi.fn(),
    cancelOrder: vi.fn(),
    getMyOrders: vi.fn(),
  }
}));

describe('useOrders hooks', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create order', async () => {
    orderService.createOrder.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    result.current.mutate({ total: 100 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orderService.createOrder).toHaveBeenCalledWith({ total: 100 });
  });

  it('should fetch orders', async () => {
    orderService.getOrders.mockResolvedValue([]);
    const { result } = renderHook(() => useOrders({ status: 'pending' }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orderService.getOrders).toHaveBeenCalledWith({ status: 'pending' });
  });

  it('should fetch single order', async () => {
    orderService.getOrderById.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useOrder(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orderService.getOrderById).toHaveBeenCalledWith(1);
  });

  it('should update order status', async () => {
    orderService.updateOrderStatus.mockResolvedValue({ status: 'COMPLETED' });
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper });

    result.current.mutate({ id: 1, status: 'COMPLETED' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'COMPLETED');
  });

  it('should cancel order', async () => {
    orderService.cancelOrder.mockResolvedValue({ status: 'CANCELLED' });
    const { result } = renderHook(() => useCancelOrder(), { wrapper });

    result.current.mutate({ id: 1, reason: 'Test' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orderService.cancelOrder).toHaveBeenCalledWith(1, 'Test');
  });

  it('should fetch my orders', async () => {
    orderService.getMyOrders.mockResolvedValue([]);
    const { result } = renderHook(() => useMyOrders(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(orderService.getMyOrders).toHaveBeenCalledWith({});
  });
});
