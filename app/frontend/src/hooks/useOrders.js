import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/api';

/**
 * React Query hooks for Order API
 * 
 * These hooks wrap orderService methods with React Query
 * for automatic caching, mutations, and optimistic updates.
 * 
 * Usage:
 * const { mutate: createOrder, isPending } = useCreateOrder();
 * const { data: orders } = useOrders({ status: 'pending' });
 */

/**
 * Hook to create a new order
 * Uses useMutation for POST request
 */
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: () => {
      // Invalidate orders cache after creating new order
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    ...options,
  });
};

/**
 * Hook to fetch orders list (admin or user history)
 * @param {Object} params - Query parameters (status, page, limit)
 * @param {Object} options - React Query options
 */
export const useOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

/**
 * Hook to fetch single order by ID
 * @param {string|number} id - Order ID
 * @param {Object} options - React Query options
 */
export const useOrder = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to update order status (admin)
 */
export const useUpdateOrderStatus = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => orderService.updateOrderStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    ...options,
  });
};

/**
 * Hook to cancel an order
 */
export const useCancelOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => orderService.cancelOrder(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    ...options,
  });
};

/**
 * Hook to fetch user's order history
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useMyOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['orders', 'my-orders', params],
    queryFn: () => orderService.getMyOrders(params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};
