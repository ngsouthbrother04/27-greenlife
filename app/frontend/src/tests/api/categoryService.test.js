import { describe, it, expect, vi, beforeEach } from 'vitest';
import categoryService from '../../api/categoryService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('api/categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all categories', async () => {
    const mockResponse = { data: { data: [{ id: 1 }] } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await categoryService.getCategories();
    expect(axiosClient.get).toHaveBeenCalledWith('/categories');
    expect(result).toEqual(mockResponse.data.data);
  });

  it('should get category by slug', async () => {
    const mockResponse = { data: { id: 1 } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await categoryService.getCategoryBySlug('slug1');
    expect(axiosClient.get).toHaveBeenCalledWith('/categories/slug1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should create category', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await categoryService.createCategory({ name: 'Trees' });
    expect(axiosClient.post).toHaveBeenCalledWith('/categories', { name: 'Trees' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should update category', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await categoryService.updateCategory('c1', { name: 'Trees 2' });
    expect(axiosClient.put).toHaveBeenCalledWith('/categories/c1', { name: 'Trees 2' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete category', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await categoryService.deleteCategory('c1');
    expect(axiosClient.delete).toHaveBeenCalledWith('/categories/c1');
    expect(result).toEqual(mockResponse.data);
  });
});
