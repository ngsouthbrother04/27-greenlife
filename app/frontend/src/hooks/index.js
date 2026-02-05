/**
 * Hooks Index - Export all custom hooks
 * Centralized export for easy imports
 * 
 * Usage:
 * import { useCart, useProducts, useCreateOrder } from '@/hooks';
 */

// Store hooks
export { default as useCart } from './useCart';
export { default as useAuth } from './useAuth';

// Product hooks (React Query)
export {
  useProducts,
  useProduct,
  useFeaturedProducts,
  useCategories,
  useProductSearch
} from './useProducts';

// Order hooks (React Query)
export {
  useCreateOrder,
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  useCancelOrder,
  useMyOrders
} from './useOrders';

// Payment hooks (React Query)
export {
  useCreatePayment,
  useVerifyPayment,
  usePaymentStatus,
  usePaymentMethods,
  useRequestRefund
} from './usePayments';
export * from './useAdminProducts';
