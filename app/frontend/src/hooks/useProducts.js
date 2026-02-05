import { useQuery } from '@tanstack/react-query';
import { productService } from '@/api';

/**
 * React Query hooks for Product API
 * 
 * These hooks wrap productService methods with React Query
 * for automatic caching, refetching, and loading states.
 * 
 * Usage in components:
 * const { data, isLoading, error } = useProducts({ category: 'whitening' });
 * const { data: product } = useProduct(productId);
 */

/**
 * Hook to fetch products list with filters
 * @param {Object} params - Query parameters (category, search, page, limit, sort)
 * @param {Object} options - React Query options
 */
export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch single product by ID
 * @param {string|number} id - Product ID
 * @param {Object} options - React Query options
 */
export const useProduct = (id, options = {}) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id, // Only fetch if id is provided
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook to fetch featured products for homepage
 * @param {number} limit - Number of products
 * @param {Object} options - React Query options
 */
export const useFeaturedProducts = (limit = 8, options = {}) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * Hook to fetch product categories
 * @param {Object} options - React Query options
 */
export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories change rarely
    ...options,
  });
};

/**
 * Hook to search products
 * @param {string} keyword - Search keyword
 * @param {Object} options - React Query options
 */
export const useProductSearch = (keyword, options = {}) => {
  return useQuery({
    queryKey: ['products', 'search', keyword],
    queryFn: () => productService.searchProducts(keyword),
    enabled: !!keyword && keyword.length >= 2, // Only search with 2+ chars
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};
