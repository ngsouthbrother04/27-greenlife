import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import productService from '@/api/productService';
import { useAdminProducts } from '../../hooks/useAdminProducts';

vi.mock('@/api/productService', () => ({
  default: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  }
}));

describe('useAdminProducts hooks', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create product', async () => {
    productService.createProduct.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useAdminProducts(), { wrapper });

    act(() => {
      result.current.createProduct({ name: 'Pine' });
    });

    await waitFor(() => expect(result.current.isCreating).toBe(false));
    expect(productService.createProduct).toHaveBeenCalledWith({ name: 'Pine' });
  });

  it('should update product', async () => {
    productService.updateProduct.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useAdminProducts(), { wrapper });

    act(() => {
      result.current.updateProduct({ id: 1, data: { name: 'Pine2' } });
    });

    await waitFor(() => expect(result.current.isUpdating).toBe(false));
    expect(productService.updateProduct).toHaveBeenCalledWith(1, { name: 'Pine2' });
  });

  it('should delete product', async () => {
    productService.deleteProduct.mockResolvedValue({ id: 1 });
    const { result } = renderHook(() => useAdminProducts(), { wrapper });

    act(() => {
      result.current.deleteProduct(1);
    });

    await waitFor(() => expect(result.current.isDeleting).toBe(false));
    expect(productService.deleteProduct).toHaveBeenCalledWith(1);
  });
});
