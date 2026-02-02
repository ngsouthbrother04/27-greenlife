import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth Store - Zustand store for authentication state
 * Uses persist middleware to maintain login state across browser sessions
 * 
 * B2C E-commerce flow:
 * - User login → setUser() with token
 * - User logout → logout() clears state
 * - Protected routes check isAuthenticated
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // Current user object: { id, email, name, role, ... }
      user: null,

      // JWT token for API authentication
      token: null,

      // Loading state for auth operations
      isLoading: false,

      // Check if user is authenticated
      isAuthenticated: () => {
        return !!get().token && !!get().user;
      },

      // Set user after successful login
      setUser: (user, token) => {
        set({ user, token, isLoading: false });
      },

      // Update user profile
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      // Set loading state
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Logout - clear all auth state
      logout: () => {
        set({ user: null, token: null, isLoading: false });
      },

      // Get token for API requests
      getToken: () => {
        return get().token;
      },
    }),
    {
      name: 'greenlife-auth', // localStorage key
    }
  )
);

export default useAuthStore;
