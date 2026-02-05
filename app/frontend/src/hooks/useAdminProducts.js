import { useMutation, useQueryClient } from '@tanstack/react-query';
import productService from '@/api/productService'; // Fixed: Default import

/**
 * Hook for Admin Product Operations
 * Provides mutations for Create, Update, Delete products
 */
export const useAdminProducts = () => {
  const queryClient = useQueryClient();

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: (newProduct) => productService.createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProduct: createProductMutation.mutate,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutate,
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutate,
    isDeleting: deleteProductMutation.isPending,
  };
};
