import axiosClient from './axiosClient';

/**
 * Product Service
 * 
 * API calls for product-related operations in B2C e-commerce flow and Admin.
 * All methods return promises compatible with React Query.
 */
const productService = {
  /**
   * Get all products with optional filters
   */
  getProducts: async (params = {}) => {
    // Backend expects: page, limit, search, categoryId, minPrice, maxPrice, sort
    // Frontend params might need mapping if keys differ
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 12,
      search: params.search,
      categoryId: params.category, // Assuming frontend passes category ID or slug. Backend uses IDs.
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sort: params.sort // price_asc, price_desc, name_asc, name_desc, etc.
    };

    // Clean undefined keys
    Object.keys(queryParams).forEach(key => queryParams[key] === undefined && delete queryParams[key]);

    const response = await axiosClient.get('/products', { params: queryParams });
    return response.data.data; // { products, total, totalPages }
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id) => {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data.data.product; // Return product object directly
  },

  /**
   * Get featured products for homepage
   */
  getFeaturedProducts: async (limit = 8) => {
    const response = await axiosClient.get('/products', { params: { limit, sort: 'createdAt_desc' } });
    return response.data?.data?.products || [];
  },

  /**
   * Get trending products (best sellers)
   */
  getTrendingProducts: async (limit = 6) => {
    const response = await axiosClient.get('/products/trending', { params: { limit } });
    return response.data?.data?.products || [];
  },

  /**
   * Get product categories
   */
  getCategories: async () => {
    // If backend has /categories endpoint
    try {
      const response = await axiosClient.get('/categories');
      return response.data?.data || [];
    } catch (error) {
      console.warn("Categories API not implemented, returning empty", error);
      return [];
    }
  },

  /**
   * Search products by keyword
   */
  searchProducts: async (keyword) => {
    const response = await axiosClient.get('/products', { params: { search: keyword } });
    return response.data?.data?.products || [];
  },

  // --- Admin CRUD Operations ---

  createProduct: async (productData) => {
    const response = await axiosClient.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await axiosClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data;
  },

  // --- Reviews ---
  addReview: async (id, reviewData) => {
    const response = await axiosClient.post(`/products/${id}/reviews`, reviewData);
    return response.data;
  },

  getReviews: async (id) => {
    const response = await axiosClient.get(`/products/${id}/reviews`);
    return response.data;
  }
};

export default productService;
