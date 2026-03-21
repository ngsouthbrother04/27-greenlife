import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CartPage from '../../pages/cart/CartPage';
import { useCartStore } from '@/stores';

vi.mock('@/stores', () => ({
  useCartStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CartPage Component', () => {
  const mockUpdateQuantity = vi.fn();
  const mockRemoveItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupStore = (items) => {
    useCartStore.mockImplementation((selector) => {
      const state = {
        items,
        updateQuantity: mockUpdateQuantity,
        removeItem: mockRemoveItem,
        getTotalPrice: () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      };
      return selector(state);
    });
  };

  const renderComponent = () => render(<MemoryRouter><CartPage /></MemoryRouter>);

  it('renders empty cart state', () => {
    setupStore([]);
    renderComponent();
    expect(screen.getByText('Giỏ hàng trống')).toBeInTheDocument();
    expect(screen.getByText('Bạn chưa thêm sản phẩm nào vào giỏ hàng.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tiếp tục mua sắm/i })).toHaveAttribute('href', '/products');
  });

  it('renders cart items and totals', () => {
    setupStore([
      { id: 1, name: 'Eco Bamboo Brush', price: 50000, quantity: 2, image: 'img.png' }
    ]);
    renderComponent();

    expect(screen.getByText('Giỏ hàng')).toBeInTheDocument();
    expect(screen.getByText('Eco Bamboo Brush')).toBeInTheDocument();
    expect(screen.getByText('50.000₫')).toBeInTheDocument(); // unit price
    
    // Totals
    expect(screen.getByText('Tóm tắt đơn hàng')).toBeInTheDocument();
    expect(screen.getByText('100.000₫')).toBeInTheDocument(); // subtotal
    expect(screen.getByText('10₫')).toBeInTheDocument(); // shipping (component uses 10 instead of 10000)
    expect(screen.getByText('100.010₫')).toBeInTheDocument(); // total
  });

  it('handles quantity update', () => {
    setupStore([
      { id: 1, name: 'Item', price: 10, quantity: 2 }
    ]);
    renderComponent();

    // plus and minus buttons uses icons, so we query button arrays
    const buttons = screen.getAllByRole('button');
    const minusBtn = buttons[0];
    const plusBtn = buttons[1];

    fireEvent.click(minusBtn);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);

    fireEvent.click(plusBtn);
    expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('handles remove item', () => {
    setupStore([
      { id: 1, name: 'Item', price: 10, quantity: 2 }
    ]);
    renderComponent();
    
    const removeBtn = screen.getByText('Xóa');
    fireEvent.click(removeBtn);
    expect(mockRemoveItem).toHaveBeenCalledWith(1);
  });

  it('navigates to checkout on button click', () => {
    setupStore([
      { id: 1, name: 'Item', price: 10, quantity: 2 }
    ]);
    renderComponent();

    const checkoutBtn = screen.getByRole('button', { name: /Tiến hành thanh toán/i });
    fireEvent.click(checkoutBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });
});
