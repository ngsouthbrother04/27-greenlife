import { describe, it, expect, vi, beforeEach } from 'vitest';
import userService from '../../api/userService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('api/userService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should get profile', async () => {
    const mockResponse = { data: { id: 1 } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await userService.getProfile();
    expect(axiosClient.get).toHaveBeenCalledWith('/users/profile');
    expect(result).toEqual(mockResponse.data);
  });

  it('should update profile', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await userService.updateProfile({ name: 'Test' });
    expect(axiosClient.put).toHaveBeenCalledWith('/users/profile', { name: 'Test' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should change password', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await userService.changePassword({ oldPwd: '1' });
    expect(axiosClient.put).toHaveBeenCalledWith('/users/change-password', { oldPwd: '1' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should get addresses', async () => {
    const mockResponse = { data: [] };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await userService.getAddresses();
    expect(axiosClient.get).toHaveBeenCalledWith('/users/addresses');
    expect(result).toEqual(mockResponse.data);
  });

  it('should add address', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await userService.addAddress({ city: 'HCM' });
    expect(axiosClient.post).toHaveBeenCalledWith('/users/addresses', { city: 'HCM' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should update address', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await userService.updateAddress('a1', { city: 'HN' });
    expect(axiosClient.put).toHaveBeenCalledWith('/users/addresses/a1', { city: 'HN' });
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete address', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await userService.deleteAddress('a1');
    expect(axiosClient.delete).toHaveBeenCalledWith('/users/addresses/a1');
    expect(result).toEqual(mockResponse.data);
  });

  it('should set default address', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const result = await userService.setDefaultAddress('a1');
    expect(axiosClient.put).toHaveBeenCalledWith('/users/addresses/a1/default');
    expect(result).toEqual(mockResponse.data);
  });
});
