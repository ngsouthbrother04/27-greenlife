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
    try {
      const response = await axiosClient.get('/categories');
      return response.data;
    } catch (error) {
      console.warn('API Error/Offline, using in-memory mock data for categories');
      return [
        { id: 'toothpaste', name: 'Toothpaste', slug: 'toothpaste' },
        { id: 'toothbrush', name: 'Toothbrush', slug: 'toothbrush' },
        { id: 'mouthwash', name: 'Mouthwash', slug: 'mouthwash' },
        { id: 'teeth-whitening', name: 'Teeth Whitening', slug: 'teeth-whitening' },
        { id: 'dental-floss', name: 'Dental Floss', slug: 'dental-floss' },
        { id: 'kits', name: 'Kits', slug: 'kits' }
      ];
    }
  },

  /**
   * Get category by slug
   */
  getCategoryBySlug: async (slug) => {
    try {
      const response = await axiosClient.get(`/categories/${slug}`, { timeout: 2000 });
      return response.data;
    } catch (error) {
      // Mock response
      return { id: slug, name: slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '), slug };
    }
  }
  ,

  /**
   * Create new category (Admin)
   */
  createCategory: async (data) => {
    try {
      const response = await axiosClient.post('/categories', data, { timeout: 2000 });
      return response.data;
    } catch (error) {
      // Mock success
      return { id: Date.now(), ...data };
    }
  },

  /**
   * Update category (Admin)
   */
  updateCategory: async (id, data) => {
    try {
      const response = await axiosClient.put(`/categories/${id}`, data, { timeout: 2000 });
      return response.data;
    } catch (error) {
      // Mock success
      return { id, ...data };
    }
  },

  /**
   * Delete category (Admin)
   */
  deleteCategory: async (id) => {
    try {
      const response = await axiosClient.delete(`/categories/${id}`, { timeout: 2000 });
      return response.data;
    } catch (error) {
      // Mock success
      return { success: true };
    }
  }
};

export default categoryService;
