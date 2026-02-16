import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosClient from '@/api/axiosClient';

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

      // ... (existing code)

      // Set user after successful login
      setUser: (user, token) => {
        set({ user, token, isLoading: false });

        // Manually set default header for immediate use (fixes race condition with localStorage)
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Sync cart with backend
        import('./cartStore').then((module) => {
          console.log('DEBUG: Triggering syncWithBackend from authStore');
          module.default.getState().syncWithBackend();
        }).catch(err => console.error('DEBUG: Failed to import cartStore:', err));
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

        // Clear default header
        delete axiosClient.defaults.headers.common['Authorization'];

        // Clear cart state
        import('./cartStore').then((module) => {
          module.default.getState().clearCart();
        });
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
