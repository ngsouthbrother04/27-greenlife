import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrderDetailPage from '../../pages/checkout/OrderDetailPage';
import orderService from '@/api/orderService';

vi.mock('@/api/orderService', () => ({
  default: {
    getOrderById: vi.fn(),
  }
}));

describe('OrderDetailPage Component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/orders/1']}>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  it('renders loading state initially', () => {
    orderService.getOrderById.mockReturnValue(new Promise(() => {}));
    const { container } = renderComponent();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state on failure', async () => {
    orderService.getOrderById.mockResolvedValue({});
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy đơn hàng')).toBeInTheDocument();
    });
  });

  it('renders order details correctly', async () => {
    orderService.getOrderById.mockResolvedValue({
      data: {
        order: {
          id: 1,
          status: 'COMPLETED',
          createdAt: new Date('2024-01-01T12:00:00Z').toISOString(),
          total: 100000,
          note: 'Leave at door',
          payment: { method: 'COD', status: 'SUCCESS' },
          shippingAddress: { fullName: 'John Doe', phone: '0123456789', address: '123 Main St' },
          items: [{
            quantity: 2,
            price: 50000,
            product: { name: 'Item', slug: 'item', images: [] }
          }]
        }
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Chi tiết đơn hàng #1')).toBeInTheDocument();
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Ghi chú đơn hàng')).toBeInTheDocument();
      expect(screen.getByText('Leave at door')).toBeInTheDocument();
      expect(screen.getByText('Item')).toBeInTheDocument();
      expect(screen.getAllByText('100.000₫').length).toBeGreaterThan(0); // total calculation
    });
  });
});
