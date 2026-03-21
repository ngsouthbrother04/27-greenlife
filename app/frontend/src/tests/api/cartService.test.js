import { describe, it, expect, vi, beforeEach } from 'vitest';
import cartService from '../../api/cartService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('api/cartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch cart correctly', async () => {
    const mockResponse = { data: { status: 'success', data: { cart: {} } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await cartService.getCart();

    expect(axiosClient.get).toHaveBeenCalledWith('/cart');
    expect(result).toEqual(mockResponse.data);
  });

  it('should add to cart with correct args', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await cartService.addToCart('prod1', 2);

    expect(axiosClient.post).toHaveBeenCalledWith('/cart', { productId: 'prod1', quantity: 2 });
    expect(result).toEqual(mockResponse.data);
  });

  it('should bulk add to cart with correct args', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const items = [{ productId: 'prod1', quantity: 1 }];
    const result = await cartService.bulkAddToCart(items);

    expect(axiosClient.post).toHaveBeenCalledWith('/cart/bulk', { items });
    expect(result).toEqual(mockResponse.data);
  });

  it('should update cart item', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await cartService.updateCartItem('prod1', 5);

    expect(axiosClient.put).toHaveBeenCalledWith('/cart', { productId: 'prod1', quantity: 5 });
    expect(result).toEqual(mockResponse.data);
  });

  it('should remove cart item', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await cartService.removeCartItem('prod1');

    expect(axiosClient.delete).toHaveBeenCalledWith(`/cart/prod1`);
    expect(result).toEqual(mockResponse.data);
  });

  it('should clear cart', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await cartService.clearCart();

    expect(axiosClient.delete).toHaveBeenCalledWith('/cart');
    expect(result).toEqual(mockResponse.data);
  });
});
