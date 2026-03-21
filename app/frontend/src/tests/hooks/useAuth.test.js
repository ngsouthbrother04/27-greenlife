import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock persist middleware
vi.mock('zustand/middleware', () => ({
  persist: (config) => config,
}));

import useAuth from '../../hooks/useAuth';
import useAuthStore from '../../stores/authStore';

describe('useAuth hook', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isLoading: false });
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should allow login', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login({ id: 1, name: 'Test User' }, 'token-abc');
    });

    expect(result.current.user).toEqual({ id: 1, name: 'Test User' });
    expect(result.current.token).toBe('token-abc');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should allow logout', () => {
    useAuthStore.setState({ user: { id: 1 }, token: 'abc' });
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should update user and set loading', () => {
    useAuthStore.setState({ user: { id: 1, name: 'John' } });
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.updateUser({ name: 'Jane' });
      result.current.setLoading(true);
    });

    expect(result.current.user.name).toBe('Jane');
    expect(result.current.isLoading).toBe(true);
  });
});
