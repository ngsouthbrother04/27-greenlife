import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminService from '../../api/adminService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: { get: vi.fn() }
}));

describe('api/adminService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should get stats with default range', async () => {
    const mockResponse = { data: { users: 10 } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await adminService.getStats();
    expect(axiosClient.get).toHaveBeenCalledWith('/admin/stats?range=30d');
    expect(result).toEqual(mockResponse);
  });

  it('should get stats with custom range', async () => {
    const mockResponse = { data: { users: 10 } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await adminService.getStats('7d');
    expect(axiosClient.get).toHaveBeenCalledWith('/admin/stats?range=7d');
    expect(result).toEqual(mockResponse);
  });
});
