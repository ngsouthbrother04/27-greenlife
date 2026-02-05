import axiosClient from './axiosClient';

/**
 * Payment Service
 * 
 * API calls for payment-related operations.
 * Prepared for VNPay sandbox integration.
 * 
 * B2C Payment Flow:
 * 1. User confirms order -> createPayment
 * 2. Redirect to payment gateway
 * 3. Gateway callback -> verifyPayment
 * 4. Update order status based on result
 */
const paymentService = {
  /**
   * Create payment request and get payment URL
   * @param {Object} paymentData - Payment information
   * @param {string|number} paymentData.orderId - Order ID to pay
   * @param {number} paymentData.amount - Payment amount in VND
   * @param {string} paymentData.method - Payment method (vnpay, momo, zalopay)
   * @param {string} paymentData.returnUrl - URL to redirect after payment
   * @returns {Promise} - Payment URL and transaction info
   */
  createPayment: async (paymentData) => {
    const response = await axiosClient.post('/payments/create', paymentData);
    return response.data;
  },

  /**
   * Verify payment result after gateway callback
   * Called when user returns from payment gateway
   * 
   * @param {Object} params - Payment gateway response params
   * @returns {Promise} - Payment verification result
   */
  verifyPayment: async (params) => {
    const response = await axiosClient.get('/payments/verify', { params });
    return response.data;
  },

  /**
   * Get payment status by order ID
   * @param {string|number} orderId - Order ID
   * @returns {Promise} - Payment status
   */
  getPaymentStatus: async (orderId) => {
    const response = await axiosClient.get(`/payments/status/${orderId}`);
    return response.data;
  },

  /**
   * Get available payment methods
   * @returns {Promise} - List of available payment methods
   */
  getPaymentMethods: async () => {
    const response = await axiosClient.get('/payments/methods');
    return response.data;
  },

  /**
   * Request refund for an order
   * @param {Object} refundData - Refund request data
   * @param {string|number} refundData.orderId - Order ID
   * @param {string} refundData.reason - Refund reason
   * @returns {Promise} - Refund request result
   */
  requestRefund: async (refundData) => {
    const response = await axiosClient.post('/payments/refund', refundData);
    return response.data;
  },
};

export default paymentService;
