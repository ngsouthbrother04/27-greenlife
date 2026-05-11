import { describe, it, expect, vi, beforeEach } from 'vitest';
import authService from '../../api/authService';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('api/authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call login endpoint with correct payload', async () => {
    const mockResponse = { data: { status: 'success', data: { user: {}, token: 'test' } } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const payload = { email: 'test@example.com', password: 'password123' };
    const result = await authService.login(payload);

    expect(axiosClient.post).toHaveBeenCalledWith('/auth/login', payload);
    expect(result).toEqual(mockResponse.data);
  });

  it('should call register endpoint with correct payload', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const payload = {
      fullName: 'Test',
      email: 'test@test.com',
      password: '123',
      phone: '0123456789',
      address: '123 Test Street',
      city: 'HCMC'
    };
    const result = await authService.register(payload);

    expect(axiosClient.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual(mockResponse.data);
  });

  it('should fetch profile correctly', async () => {
    const mockResponse = { data: { status: 'success', data: { user: {} } } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await authService.getProfile();
    expect(axiosClient.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockResponse.data);
  });

  it('should update user profile correctly', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const payload = { fullName: 'New Name' };
    const result = await authService.updateProfile(payload);
    expect(axiosClient.put).toHaveBeenCalledWith('/users/me', payload);
    expect(result).toEqual(mockResponse.data);
  });

  it('should change password correctly', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.put.mockResolvedValue(mockResponse);

    const payload = { currentPassword: '123', newPassword: '456' };
    const result = await authService.changePassword(payload);
    expect(axiosClient.put).toHaveBeenCalledWith('/users/me/password', payload);
    expect(result).toEqual(mockResponse.data);
  });

  it('should call delete address correctly', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await authService.deleteAddress('123');
    expect(axiosClient.delete).toHaveBeenCalledWith('/users/me/addresses/123');
    expect(result).toEqual(mockResponse.data);
  });
  
  it('should call default address exactly', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.post.mockResolvedValue(mockResponse);

    const result = await authService.setDefaultAddress('123');
    expect(axiosClient.post).toHaveBeenCalledWith('/users/me/addresses/123/set-default');
    expect(result).toEqual(mockResponse.data);
  });

  it('should get all users exactly', async () => {
    const mockResponse = { data: { status: 'success', data: [] } };
    axiosClient.get.mockResolvedValue(mockResponse);

    const result = await authService.getAllUsers({ page: 1 });
    expect(axiosClient.get).toHaveBeenCalledWith('/users', { params: { page: 1 } });
    expect(result).toEqual(mockResponse.data);
  });

  it('should delete user exactly', async () => {
    const mockResponse = { data: { status: 'success' } };
    axiosClient.delete.mockResolvedValue(mockResponse);

    const result = await authService.deleteUser('user1');
    expect(axiosClient.delete).toHaveBeenCalledWith('/users/user1');
    expect(result).toEqual(mockResponse.data);
  });
});
