import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminOrders from '../../pages/admin/AdminOrders';
import orderService from '@/api/orderService';

vi.mock('@/api/orderService', () => ({
  default: {
    getOrders: vi.fn(),
    getAdminOrder: vi.fn(),
    updateOrderStatus: vi.fn(),
    deleteOrder: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('AdminOrders page', () => {
  let queryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  const renderPage = () => render(
    <QueryClientProvider client={queryClient}>
      <AdminOrders />
    </QueryClientProvider>
  );

  it('sends date range filters to the admin orders query and can clear them', async () => {
    orderService.getOrders.mockResolvedValue({ data: { orders: [] } });

    renderPage();

    await waitFor(() => expect(orderService.getOrders).toHaveBeenCalledWith({ page: 1, limit: 10 }));

    fireEvent.change(screen.getByLabelText('Từ ngày'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('Đến ngày'), { target: { value: '2026-01-31' } });

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenLastCalledWith({
        page: 1,
        limit: 10,
        fromDate: '2026-01-01',
        toDate: '2026-01-31'
      });
    });

    fireEvent.click(screen.getByRole('button', { name: 'Xóa lọc' }));

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenLastCalledWith({ page: 1, limit: 10 });
    });
  });

  it('shows pagination controls and changes page', async () => {
    orderService.getOrders
      .mockResolvedValueOnce({
        data: {
          orders: Array.from({ length: 10 }, (_, index) => ({
            id: index + 1,
            total: 1000,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            user: { fullName: `User ${index + 1}`, email: `user${index + 1}@mail.com` }
          })),
          pagination: { page: 1, limit: 10, total: 21, totalPages: 3 }
        }
      })
      .mockResolvedValueOnce({
        data: {
          orders: Array.from({ length: 10 }, (_, index) => ({
            id: index + 11,
            total: 1000,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            user: { fullName: `User ${index + 11}`, email: `user${index + 11}@mail.com` }
          })),
          pagination: { page: 2, limit: 10, total: 21, totalPages: 3 }
        }
      });

    renderPage();

    await screen.findByRole('button', { name: '2' });

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    await waitFor(() => {
      expect(orderService.getOrders).toHaveBeenLastCalledWith({ page: 2, limit: 10 });
    });
  });

  it('condenses page numbers when there are many pages', async () => {
    orderService.getOrders.mockResolvedValue({
      data: {
        orders: Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          total: 1000,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          user: { fullName: `User ${index + 1}`, email: `user${index + 1}@mail.com` }
        })),
        pagination: { page: 1, limit: 10, total: 100, totalPages: 10 }
      }
    });

    renderPage();

    expect(await screen.findByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByText('...')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '6' })).not.toBeInTheDocument();
  });
});