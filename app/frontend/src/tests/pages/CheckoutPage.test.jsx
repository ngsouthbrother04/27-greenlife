import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckoutPage from '../../pages/checkout/CheckoutPage';
import { useCartStore, useAuthStore } from '@/stores';

vi.mock('@/stores', () => ({
  useCartStore: vi.fn(),
  useAuthStore: vi.fn(),
}));

const { mockCreateOrder } = vi.hoisted(() => ({
  mockCreateOrder: vi.fn(),
}));

vi.mock('@/api/orderService', () => ({
  default: {
    createOrder: mockCreateOrder,
  }
}));

// Mock react-hot-toast window.location
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutPage Component', () => {
  let queryClient;
  const mockClearCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();

    useAuthStore.mockReturnValue({
      user: { email: 'user@example.com' }
    });

    useCartStore.mockReturnValue({
      items: [{ id: 1, name: 'Item', price: 100, quantity: 1, image: 'img.png' }],
      getTotalPrice: () => 100,
      clearCart: mockClearCart
    });
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CheckoutPage />
      </MemoryRouter>
    </QueryClientProvider>
  );

  it('redirects to products if cart is empty', () => {
    useCartStore.mockReturnValue({ items: [], getTotalPrice: () => 0, clearCart: vi.fn() });
    renderComponent();
    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  it('renders checkout form and summary', () => {
    renderComponent();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Shipping Information')).toBeInTheDocument();
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Item')).toBeInTheDocument();
    expect(screen.getAllByText('100₫').length).toBeGreaterThan(0);
  });

  it('validates required fields', async () => {
    renderComponent();
    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Full name is required (min 2 chars)')).toBeInTheDocument();
      expect(screen.getByText('Address is required (min 5 chars)')).toBeInTheDocument();
    });
  });

  it('handles successful order submission with COD', async () => {
    mockCreateOrder.mockResolvedValue({ data: { order: { id: 123 } } });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John Smith' } });
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0987654321' } });
    fireEvent.change(screen.getByPlaceholderText('123 Green Street, District 1, HCMC'), { target: { value: '123 Fake Street' } });

    // COD is default selected
    const submitBtn = screen.getByRole('button', { name: /Place Order/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateOrder).toHaveBeenCalledWith({
        fullName: 'John Smith',
        phone: '0987654321',
        email: 'user@example.com', // from auth user if empty
        address: '123 Fake Street',
        paymentMethod: 'cod',
        note: '',
        items: [{ productId: 1, quantity: 1, price: 100 }],
        totalAmount: 100
      });
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/profile/orders/123');
    });
  });
});
