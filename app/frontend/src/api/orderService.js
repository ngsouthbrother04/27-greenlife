import axiosClient from './axiosClient';

/**
 * Order Service
 * 
 * API calls for order-related operations in B2C e-commerce flow.
 * Handles order creation, retrieval, and status management.
 */
const orderService = {
  /**
   * Create a new order
   */
  createOrder: async (orderData) => {
    const response = await axiosClient.post('/orders', orderData);
    return response.data;
  },

  /**
   * Get all orders (Admin)
   */
  getOrders: async (params = {}) => {
    const response = await axiosClient.get('/admin/orders', { params });
    return response.data;
  },

  /**
   * Get single order by ID
   */
  getOrderById: async (id) => {
    // Try user endpoint first, if fails (404/403), might be admin endpoint
    // But typically we should know context. For now, let's use the generic endpoint
    // Backend has: /users/me/orders/:id and /admin/orders/:id
    // But `getOrderById` in backend `order.service.js` is shared.
    // Let's assume we use /me/orders/:id for customers.
    // If admin, we might need a different service method or check param.
    // For simplicity, let's try the user endpoint.
    const response = await axiosClient.get(`/me/orders/${id}`);
    return response.data;
  },

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: async (id, status) => {
    const response = await axiosClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cancel an order
   */
  cancelOrder: async (id, reason) => {
    const response = await axiosClient.patch(`/me/orders/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Get user's order history
   */
  getMyOrders: async (params = {}) => {
    const response = await axiosClient.get('/me/orders', { params });
    return response.data;
  },

  /**
   * Delete order (Admin)
   */
  deleteOrder: async (id) => {
    const response = await axiosClient.delete(`/admin/orders/${id}`);
    return response.data;
  },

  /**
   * Get single order (Admin)
   */
  getAdminOrder: async (id) => {
    const response = await axiosClient.get(`/admin/orders/${id}`);
    return response.data;
  }
};

export default orderService;
