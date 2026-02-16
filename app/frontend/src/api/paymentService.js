import axiosClient from './axiosClient';

/**
 * Payment Service
 * 
 * API calls for payment-related operations.
 * Integrated with MoMo Sandbox.
 */
const paymentService = {
  /**
   * Create payment request and get payment URL (MoMo)
   * @param {Object} paymentData - { orderId }
   */
  createPayment: async (paymentData) => {
    // Backend expects { orderId }. It calculates amount from order.
    const response = await axiosClient.post('/payments/momo/create', {
      orderId: Number(paymentData.orderId)
    });
    return response.data; // { payUrl, ... }
  },

  /**
   * Get payment methods (optional)
   */
  getPaymentMethods: async () => {
    return [
      { id: 'momo', name: 'MoMo E-Wallet', icon: 'https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png' },
      { id: 'cod', name: 'Cash on Delivery', icon: '' }
    ];
  },
};

export default paymentService;
