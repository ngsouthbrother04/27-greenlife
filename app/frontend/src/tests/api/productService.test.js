import { describe, it, expect, vi, beforeEach } from 'vitest';
import productService from '../../api/productService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('api/productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format getProducts params correctly', async () => {
    const mockResponse = { data: { data: { products: [] } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.getProducts({ page: 2, search: 'test', limit: 10 });
    
    expect(axiosClient.get).toHaveBeenCalledWith('/products', {
      params: { page: 2, limit: 10, search: 'test' }
    });
    expect(result).toEqual({ products: [] });
  });

  it('should ignore undefined values in getProducts params', async () => {
    const mockResponse = { data: { data: { products: [] } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    await productService.getProducts({ category: undefined, minPrice: undefined });
    
    expect(axiosClient.get).toHaveBeenCalledWith('/products', {
      params: { page: 1, limit: 12 }
    });
  });

  it('should fetch product by id', async () => {
    const mockResponse = { data: { data: { product: { id: 1 } } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.getProductById(1);
    expect(axiosClient.get).toHaveBeenCalledWith('/products/1');
    expect(result).toEqual({ id: 1 });
  });

  it('should fetch featured products', async () => {
    const mockResponse = { data: { data: { products: [] } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.getFeaturedProducts();
    expect(axiosClient.get).toHaveBeenCalledWith('/products', { params: { limit: 8, sort: 'createdAt_desc' } });
    expect(result).toEqual([]);
  });

  it('should fetch trending products', async () => {
    const mockResponse = { data: { data: { products: [] } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.getTrendingProducts();
    expect(axiosClient.get).toHaveBeenCalledWith('/products/trending', { params: { limit: 6 } });
    expect(result).toEqual([]);
  });

  it('should handle getCategories success', async () => {
    const mockResponse = { data: { data: [{ id: 1 }] } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.getCategories();
    expect(axiosClient.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should handle getCategories error gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    axiosClient.get.mockRejectedValue(new Error('API Error'));

    const result = await productService.getCategories();
    expect(axiosClient.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual([]);
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should handle search products', async () => {
    const mockResponse = { data: { data: { products: [{ id: 1 }] } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.searchProducts('tree');
    expect(axiosClient.get).toHaveBeenCalledWith('/products', { params: { search: 'tree' } });
    expect(result).toEqual([{ id: 1 }]);
  });

  it('should create product', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await productService.createProduct({ name: 'Pine' });
    expect(axiosClient.post).toHaveBeenCalledWith('/products', { name: 'Pine' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should update product', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await productService.updateProduct('p1', { price: 100 });
    expect(axiosClient.put).toHaveBeenCalledWith('/products/p1', { price: 100 });
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete product', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await productService.deleteProduct('p1');
    expect(axiosClient.delete).toHaveBeenCalledWith('/products/p1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should add product review', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await productService.addReview('p1', { rating: 5 });
    expect(axiosClient.post).toHaveBeenCalledWith('/products/p1/reviews', { rating: 5 });
    expect(result).toEqual(mockResponse.data);
  });

  it('should fetch product reviews', async () => {
    const mockResponse = { data: { status: 'success', data: [] } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await productService.getReviews('p1');
    expect(axiosClient.get).toHaveBeenCalledWith('/products/p1/reviews');
    expect(result).toEqual(mockResponse.data);
  });
});
