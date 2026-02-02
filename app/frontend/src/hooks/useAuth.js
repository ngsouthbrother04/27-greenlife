import { useAuthStore } from '@/stores';

/**
 * useAuth - Custom hook for authentication operations
 * Provides a clean interface to auth store
 * 
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  /**
   * Login helper - sets user and token after successful API call
   * @param {Object} userData - User data from API
   * @param {string} authToken - JWT token from API
   */
  const login = (userData, authToken) => {
    setUser(userData, authToken);
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: isAuthenticated(),
    login,
    logout,
    updateUser,
    setLoading,
  };
};

export default useAuth;
