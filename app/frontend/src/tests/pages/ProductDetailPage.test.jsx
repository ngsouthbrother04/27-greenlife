import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProductDetailPage from '../../pages/product/ProductDetailPage';
import { useProduct } from '@/hooks';
import { useCartStore, useAuthStore } from '@/stores';

vi.mock('@/hooks', () => ({
  useProduct: vi.fn(),
}));

vi.mock('@/stores', () => ({
  useCartStore: vi.fn(),
  useAuthStore: vi.fn(),
}));

vi.mock('@/api/productService', () => ({
  default: {
    addReview: vi.fn(),
  }
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

describe('ProductDetailPage Component', () => {
  let queryClient;
  const mockAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();

    useAuthStore.mockReturnValue({ user: null });
    useCartStore.mockReturnValue({
      addItem: mockAddItem,
      getItemQuantity: () => 0
    });
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/product/1']}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

  it('renders loading state', () => {
    useProduct.mockReturnValue({ isLoading: true });
    const { container } = renderComponent();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders product details and handles add to cart', async () => {
    useProduct.mockReturnValue({
      data: {
        id: 1,
        name: 'Test Product X23',
        price: 50000,
        originalPrice: 60000,
        description: 'Great product description',
        stock: 5,
        rating: 4.5,
        reviews: [],
        images: ['img1.png']
      },
      isLoading: false
    });
    mockAddItem.mockResolvedValue({ success: true });

    renderComponent();

    // The name appears in breadcrumb and heading
    expect(await screen.findAllByText('Test Product X23')).toHaveLength(2);
    expect(screen.getByText('50.000₫')).toBeInTheDocument();
    
    const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addToCartBtn);

    expect(mockAddItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, name: 'Test Product X23', price: 50000 }),
      1
    );
  });

  it('disables add to cart when out of stock', async () => {
    useProduct.mockReturnValue({
      data: {
        id: 1,
        name: 'Test Product',
        price: 50000,
        stock: 0,
      },
      isLoading: false
    });

    renderComponent();

    const addToCartBtn = await screen.findByRole('button', { name: /Out of Stock/i });
    expect(addToCartBtn).toBeDisabled();
  });
});
