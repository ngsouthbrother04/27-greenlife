import axiosClient from './axiosClient';

/**
 * Category Service
 * 
 * API calls for category-related operations.
 */
const categoryService = {
  /**
   * Get all categories
   */
  getCategories: async () => {
    const response = await axiosClient.get('/categories');
    return response.data.data; // Backend returns { status: 'success', data: [...] }
  },

  /**
   * Get category by slug
   */
  getCategoryBySlug: async (slug) => {
    const response = await axiosClient.get(`/categories/${slug}`);
    return response.data;
  },

  /**
   * Create new category (Admin)
   */
  createCategory: async (data) => {
    const response = await axiosClient.post('/categories', data);
    return response.data;
  },

  /**
   * Update category (Admin)
   */
  updateCategory: async (id, data) => {
    const response = await axiosClient.put(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete category (Admin)
   */
  deleteCategory: async (id) => {
    const response = await axiosClient.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
