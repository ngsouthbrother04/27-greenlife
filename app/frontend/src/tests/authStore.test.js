import { describe, it, expect, beforeEach, vi } from 'vitest';
import { create } from 'zustand';

// 1. Mock persist middleware as requested
vi.mock('zustand/middleware', () => ({
  persist: (config) => config,
}));

// Mock cartStore and axiosClient dynamically
vi.mock('@/api/axiosClient', () => ({
  default: { defaults: { headers: { common: {} } } }
}));

const mockSyncWithBackend = vi.fn();
const mockClearCart = vi.fn();

vi.mock('../stores/cartStore.js', () => ({
  default: {
    getState: () => ({
      syncWithBackend: mockSyncWithBackend,
      clearCart: mockClearCart
    })
  }
}));

import useAuthStore from '../stores/authStore.js';
import axiosClient from '@/api/axiosClient';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false });
    vi.clearAllMocks();
  });

  it('should return correct authentication status', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    useAuthStore.setState({ user: { id: 1 }, token: 'abc' });
    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it('should set user and trigger cart sync', async () => {
    const user = { id: 1, name: 'John' };
    useAuthStore.getState().setUser(user, 'token123');
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token123');
    expect(state.isLoading).toBe(false);
    expect(axiosClient.defaults.headers.common['Authorization']).toBe('Bearer token123');

    // Wait for async import
    await new Promise(r => setTimeout(r, 10));
    expect(mockSyncWithBackend).toHaveBeenCalled();
  });

  it('should update user', () => {
    useAuthStore.setState({ user: { id: 1, name: 'John' } });
    useAuthStore.getState().updateUser({ name: 'Jane' });
    expect(useAuthStore.getState().user.name).toBe('Jane');
  });

  it('should set loading', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it('should logout and clear cart', async () => {
    useAuthStore.setState({ user: { id: 1 }, token: 'abc' });
    axiosClient.defaults.headers.common['Authorization'] = 'Bearer abc';
    
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(axiosClient.defaults.headers.common['Authorization']).toBeUndefined();

    // Wait for async import
    await new Promise(r => setTimeout(r, 10));
    expect(mockClearCart).toHaveBeenCalled();
  });

  it('should get token', () => {
    useAuthStore.setState({ token: 'xyz' });
    expect(useAuthStore.getState().getToken()).toBe('xyz');
  });
});
