/**
 * Auth Service - API calls for authentication
 * Handles login, registration, and user profile management
 */
import axiosClient from './axiosClient';

const authService = {
  // Login user: { email, password }
  login: async (data) => {
    const response = await axiosClient.post('/auth/login', data);
    return response.data; // Expected: { status: 'success', data: { user, token } }
  },

  // Register user: { fullName, email, password, phone }
  register: async (data) => {
    const response = await axiosClient.post('/auth/register', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await axiosClient.get('/users/me'); // Backend endpoint for profile
    return response.data; // Expected: { status: 'success', data: { user } }
  },

  // Update user profile
  updateProfile: async (data) => {
    const response = await axiosClient.put('/users/me', data);
    return response.data;
  },

  // Change Password
  changePassword: async (data) => {
    const response = await axiosClient.put('/users/me/password', data);
    return response.data;
  },

  // User Addresses
  getAddresses: async () => {
    const response = await axiosClient.get('/users/me/addresses');
    return response.data;
  },

  addAddress: async (data) => {
    const response = await axiosClient.post('/users/me/addresses', data);
    return response.data;
  },

  updateAddress: async (id, data) => {
    const response = await axiosClient.put(`/users/me/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await axiosClient.delete(`/users/me/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id) => {
    const response = await axiosClient.post(`/users/me/addresses/${id}/default`);
    return response.data;
  },

  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    const response = await axiosClient.get('/users', { params });
    return response.data; // { status: 'success', data: { users }, ... }
  },

  // Admin: Update user (role, etc.)
  updateUser: async (id, data) => {
    const response = await axiosClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  }
};

export default authService;
