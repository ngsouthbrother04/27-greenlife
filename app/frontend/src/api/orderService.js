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
    const response = await axiosClient.get(`/orders/${id}`);
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
    const response = await axiosClient.patch(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Get user's order history
   */
  getMyOrders: async (params = {}) => {
    const response = await axiosClient.get('/orders', { params });
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
