import { useQuery, useMutation } from '@tanstack/react-query';
import { paymentService } from '@/api';

/**
 * React Query hooks for Payment API
 * 
 * These hooks wrap paymentService methods for payment gateway integration.
 * Prepared for VNPay sandbox.
 * 
 * Usage:
 * const { mutate: createPayment, isPending } = useCreatePayment();
 * const { data: status } = usePaymentStatus(orderId);
 */

/**
 * Hook to create payment and get payment URL
 * Redirects user to payment gateway after success
 */
export const useCreatePayment = (options = {}) => {
  return useMutation({
    mutationFn: (paymentData) => paymentService.createPayment(paymentData),
    onSuccess: (data) => {
      // Redirect to payment gateway if URL is provided
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
    ...options,
  });
};

/**
 * Hook to verify payment after gateway callback
 * Called when user returns from payment gateway
 * 
 * @param {Object} params - Payment gateway response params
 * @param {Object} options - React Query options
 */
export const useVerifyPayment = (params, options = {}) => {
  return useQuery({
    queryKey: ['payment', 'verify', params],
    queryFn: () => paymentService.verifyPayment(params),
    enabled: !!params && Object.keys(params).length > 0,
    staleTime: Infinity, // Verification result doesn't change
    ...options,
  });
};

/**
 * Hook to get payment status by order ID
 * @param {string|number} orderId - Order ID
 * @param {Object} options - React Query options
 */
export const usePaymentStatus = (orderId, options = {}) => {
  return useQuery({
    queryKey: ['payment', 'status', orderId],
    queryFn: () => paymentService.getPaymentStatus(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - payment status can change
    refetchInterval: 10 * 1000, // Poll every 10 seconds while active
    ...options,
  });
};

/**
 * Hook to get available payment methods
 * @param {Object} options - React Query options
 */
export const usePaymentMethods = (options = {}) => {
  return useQuery({
    queryKey: ['payment', 'methods'],
    queryFn: () => paymentService.getPaymentMethods(),
    staleTime: 60 * 60 * 1000, // 1 hour - methods change rarely
    ...options,
  });
};

/**
 * Hook to request refund
 */
export const useRequestRefund = (options = {}) => {
  return useMutation({
    mutationFn: (refundData) => paymentService.requestRefund(refundData),
    ...options,
  });
};
