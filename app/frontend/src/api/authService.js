/**
 * Auth Service - API calls for authentication
 * Handles login, registration, and user profile management
 */
import axiosClient from './axiosClient';

const authService = {
  // Login user: { email, password }
  login: async (data) => {
    // MOCK DATA FOR TESTING
    if (data.email === 'admin@gmail.com' && data.password === '123456') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              token: 'mock-admin-token',
              user: {
                id: '1',
                name: 'Admin User',
                email: 'admin@gmail.com',
                role: 'admin'
              }
            }
          });
        }, 500);
      });
    }

    if (data.email === 'user@gmail.com' && data.password === '123456') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              token: 'mock-user-token',
              user: {
                id: '2',
                name: 'Regular User',
                email: 'user@gmail.com',
                role: 'user'
              }
            }
          });
        }, 500);
      });
    }

    return axiosClient.post('/auth/login', data);
  },

  // Register user: { name, email, password }
  register: (data) => {
    return axiosClient.post('/auth/register', data);
  },

  // Get current user profile
  getProfile: () => {
    return axiosClient.get('/auth/me');
  },

  // Update user profile
  updateProfile: async (data) => {
    // MOCK: Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            user: data // In real app, backend returns updated user
          }
        });
      }, 500);
    });
    // return axiosClient.put('/auth/me', data);
  },

  // Logout (optional - if backend invalidates token)
  logout: () => {
    // For mock users, we just resolve immediately
    return new Promise((resolve) => resolve());
    // return axiosClient.post('/auth/logout');
  }
};

export default authService;
