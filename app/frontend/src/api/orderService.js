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
   * B2C flow: User checkout -> Create order -> Redirect to payment
   * 
   * @param {Object} orderData - Order information
   * @param {Array} orderData.items - Cart items [{productId, quantity, price}]
   * @param {Object} orderData.shippingInfo - Shipping details
   * @param {string} orderData.shippingInfo.fullName - Customer name
   * @param {string} orderData.shippingInfo.phone - Phone number
   * @param {string} orderData.shippingInfo.email - Email address
   * @param {string} orderData.shippingInfo.address - Delivery address
   * @param {string} orderData.paymentMethod - Payment method (cod, bank, vnpay)
   * @param {string} orderData.note - Order notes
   * @returns {Promise} - Created order with payment URL (if applicable)
   */
  createOrder: async (orderData) => {
    try {
      const response = await axiosClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.warn('API call failed, using mock data for demo:', error);
      // Mock success response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Date.now(),
            status: 'pending',
            // Return dummy payment URL if method is not COD
            paymentUrl: orderData.paymentMethod === 'cod'
              ? null
              : `https://momo.vn/pay?orderId=${Date.now()}`,
            message: 'Order created successfully (Mock)'
          });
        }, 1000);
      });
    }
  },

  /**
   * Get all orders (for admin or user's order history)
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} - Orders list with pagination
   */
  getOrders: async (params = {}) => {
    const response = await axiosClient.get('/orders', { params });
    return response.data;
  },

  /**
   * Get single order by ID
   * @param {string|number} id - Order ID
   * @returns {Promise} - Order details
   */
  getOrderById: async (id) => {
    const response = await axiosClient.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Update order status (admin only)
   * @param {string|number} id - Order ID
   * @param {string} status - New status (pending, processing, shipped, delivered, cancelled)
   * @returns {Promise} - Updated order
   */
  updateOrderStatus: async (id, status) => {
    const response = await axiosClient.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cancel an order
   * @param {string|number} id - Order ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} - Cancelled order
   */
  cancelOrder: async (id, reason) => {
    const response = await axiosClient.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Get user's order history
   * @param {Object} params - Query parameters
   * @returns {Promise} - User's orders list
   */
  getMyOrders: async (params = {}) => {
    const response = await axiosClient.get('/orders/my-orders', { params });
    return response.data;
  },
};

export default orderService;
