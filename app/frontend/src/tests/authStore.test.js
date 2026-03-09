import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAuthStore from '../stores/authStore.js';
import * as authApi from '../api/index.js';
import useCartStore from '../stores/cartStore.js';

vi.mock('../api/authApi.js');
vi.mock('../stores/cartStore.js', () => ({
  default: {
    getState: vi.fn(() => ({
      syncWithBackend: vi.fn(),
      clearCart: vi.fn(),
    })),
  },
}));


describe('authStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated()).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  describe('setUser', () => {
    it('should set user data, token and trigger synchronization', async () => {
      const mockUser = { id: 1, name: 'Test User' };
      const mockToken = 'mock_jwt_token';

      const syncWithBackendMock = vi.fn();
      useCartStore.getState.mockReturnValue({ syncWithBackend: syncWithBackendMock, clearCart: vi.fn() });

      // Call setUser
      useAuthStore.getState().setUser(mockUser, mockToken);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated()).toBe(true);

      // Wait a bit for the async import('./cartStore') to complete inside setUser
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(syncWithBackendMock).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should clear state, local storage and cart on logout', async () => {
      // Set initial state
      useAuthStore.setState({
        user: { id: 1, name: 'Test' },
        token: 'token123',
        isLoading: false
      });

      const clearCartMock = vi.fn();
      useCartStore.getState.mockReturnValue({ clearCart: clearCartMock, syncWithBackend: vi.fn() });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated()).toBe(false);

      // Wait for async import
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(clearCartMock).toHaveBeenCalled();
    });
  });
});
