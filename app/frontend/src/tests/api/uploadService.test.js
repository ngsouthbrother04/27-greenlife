import { describe, it, expect, vi, beforeEach } from 'vitest';
import uploadService from '../../api/uploadService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: { post: vi.fn() }
}));

describe('api/uploadService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should upload a single image', async () => {
    const mockResponse = { data: { url: 'image.jpg' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = await uploadService.uploadImage(file);
    
    expect(axiosClient.post).toHaveBeenCalled();
    const args = axiosClient.post.mock.calls[0];
    expect(args[0]).toBe('/upload');
    expect(args[1] instanceof FormData).toBe(true);
    expect(args[1].get('image')).toBe(file);
    
    expect(result).toEqual(mockResponse.data);
  });

  it('should upload multiple images', async () => {
    const mockResponse = { data: [{ url: 'image1.jpg' }] };
    axiosClient.post.mockResolvedValue(mockResponse);

    const file1 = new File([''], 'test1.jpg', { type: 'image/jpeg' });
    const file2 = new File([''], 'test2.jpg', { type: 'image/jpeg' });
    const result = await uploadService.uploadMultiple([file1, file2]);
    
    expect(axiosClient.post).toHaveBeenCalled();
    const args = axiosClient.post.mock.calls[0];
    expect(args[0]).toBe('/upload/multiple');
    expect(args[1] instanceof FormData).toBe(true);
    expect(args[1].getAll('images').length).toBe(2);
    
    expect(result).toEqual(mockResponse.data);
  });
});
