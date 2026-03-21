import { describe, it, expect, vi, beforeEach } from 'vitest';
import wishlistService from '../../api/wishlistService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('api/wishlistService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should get wishlist', async () => {
    const mockResponse = { data: [] };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await wishlistService.getWishlist();
    expect(axiosClient.get).toHaveBeenCalledWith('/wishlist');
    expect(result).toEqual(mockResponse.data);
  });

  it('should add to wishlist', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await wishlistService.addToWishlist('p1');
    expect(axiosClient.post).toHaveBeenCalledWith('/wishlist', { productId: 'p1' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should remove from wishlist', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await wishlistService.removeFromWishlist('p1');
    expect(axiosClient.delete).toHaveBeenCalledWith('/wishlist/p1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should check status', async () => {
    const mockResponse = { data: { inWishlist: true } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await wishlistService.checkStatus('p1');
    expect(axiosClient.get).toHaveBeenCalledWith('/wishlist/p1/status');
    expect(result).toEqual(mockResponse.data);
  });
});
