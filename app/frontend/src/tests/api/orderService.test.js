import { describe, it, expect, vi, beforeEach } from 'vitest';
import orderService from '../../api/orderService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

describe('api/orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an order', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await orderService.createOrder({ total: 100 });
    expect(axiosClient.post).toHaveBeenCalledWith('/orders', { total: 100 });
    expect(result).toEqual(mockResponse.data);
  });

  it('should get all orders for admin', async () => {
    const mockResponse = { data: [] };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await orderService.getOrders({ page: 1 });
    expect(axiosClient.get).toHaveBeenCalledWith('/admin/orders', { params: { page: 1 } });
    expect(result).toEqual(mockResponse.data);
  });

  it('should get order by ID', async () => {
    const mockResponse = { data: { id: 1 } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await orderService.getOrderById('o1');
    expect(axiosClient.get).toHaveBeenCalledWith('/orders/o1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should update order status', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await orderService.updateOrderStatus('o1', 'COMPLETED');
    expect(axiosClient.put).toHaveBeenCalledWith('/admin/orders/o1/status', { status: 'COMPLETED' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should cancel an order', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.patch.mockResolvedValue(mockResponse);

    const result = await orderService.cancelOrder('o1', 'Changed my mind');
    expect(axiosClient.patch).toHaveBeenCalledWith('/orders/o1/cancel', { reason: 'Changed my mind' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should get user\'s order history', async () => {
    const mockResponse = { data: [] };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await orderService.getMyOrders();
    expect(axiosClient.get).toHaveBeenCalledWith('/orders', { params: {} });
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete order', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await orderService.deleteOrder('o1');
    expect(axiosClient.delete).toHaveBeenCalledWith('/admin/orders/o1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should get single order for admin', async () => {
    const mockResponse = { data: { id: 1 } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await orderService.getAdminOrder('o1');
    expect(axiosClient.get).toHaveBeenCalledWith('/admin/orders/o1');
    expect(result).toEqual(mockResponse.data);
  });
});
