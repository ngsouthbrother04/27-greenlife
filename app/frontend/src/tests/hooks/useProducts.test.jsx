import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from '@/api';
import { 
  useProducts, 
  useProduct, 
  useFeaturedProducts, 
  useCategories, 
  useProductSearch 
} from '../../hooks/useProducts';

// Mock productService
vi.mock('@/api', () => ({
  productService: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    getFeaturedProducts: vi.fn(),
    getCategories: vi.fn(),
    searchProducts: vi.fn(),
  }
}));

describe('useProducts hooks', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useProducts', () => {
    it('should fetch products', async () => {
      productService.getProducts.mockResolvedValue({ products: [], total: 0 });
      const { result } = renderHook(() => useProducts({ page: 1 }), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data).toEqual({ products: [], total: 0 });
      expect(productService.getProducts).toHaveBeenCalledWith({ page: 1 });
    });
  });

  describe('useProduct', () => {
    it('should fetch single product', async () => {
      productService.getProductById.mockResolvedValue({ id: 1, name: 'product' });
      const { result } = renderHook(() => useProduct(1), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(result.current.data).toEqual({ id: 1, name: 'product' });
      expect(productService.getProductById).toHaveBeenCalledWith(1);
    });

    it('should not fetch if id is missing', () => {
      const { result } = renderHook(() => useProduct(null), { wrapper });
      expect(result.current.isPending).toBe(true);
      expect(productService.getProductById).not.toHaveBeenCalled();
    });
  });

  describe('useFeaturedProducts', () => {
    it('should fetch featured products', async () => {
      productService.getFeaturedProducts.mockResolvedValue([]);
      const { result } = renderHook(() => useFeaturedProducts(8), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(productService.getFeaturedProducts).toHaveBeenCalledWith(8);
    });
  });

  describe('useCategories', () => {
    it('should fetch categories', async () => {
      productService.getCategories.mockResolvedValue([]);
      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(productService.getCategories).toHaveBeenCalled();
    });
  });

  describe('useProductSearch', () => {
    it('should fetch search products if keyword is 2+ length', async () => {
      productService.searchProducts.mockResolvedValue([]);
      const { result } = renderHook(() => useProductSearch('tree'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      
      expect(productService.searchProducts).toHaveBeenCalledWith('tree');
    });

    it('should not fetch if keyword is less than 2 length', () => {
      const { result } = renderHook(() => useProductSearch('a'), { wrapper });
      expect(result.current.isPending).toBe(true);
      expect(productService.searchProducts).not.toHaveBeenCalled();
    });
  });
});
