import axiosClient from './axiosClient';

// In-memory mock data store
let mockProducts = [
  {
    id: 1,
    name: 'Sparkling Mint Wonder of Peppermint Natural Mouthwash',
    price: 100,
    originalPrice: 120,
    category: 'Mouthwash',
    image: 'https://via.placeholder.com/150',
    description: 'Natural mouthwash with peppermint essence.',
    stock: 50
  },
  {
    id: 2,
    name: 'Natural Teeth Whitening Toothpaste - Tea tree & Charcoal',
    price: 200,
    originalPrice: 250,
    category: 'Toothpaste',
    image: 'https://via.placeholder.com/150',
    description: 'Whitening toothpaste with activated charcoal.',
    stock: 30
  },
  {
    id: 3,
    name: 'Organic Bamboo Toothbrush',
    price: 45,
    originalPrice: 50,
    category: 'Toothbrush',
    image: 'https://via.placeholder.com/150',
    description: 'Eco-friendly bamboo toothbrush.',
    stock: 100
  },
  {
    id: 4,
    name: 'Teeth Whitening',
    price: 100,
    originalPrice: 120,
    category: 'Teethwhitening',
    image: 'https://img.freepik.com/free-vector/cheerful-tooth-mouthwash-bottle-illustration_1308-182254.jpg?semt=ais_hybrid&w=740&q=80',
    description: 'Teeth Whitening',
    stock: 5
  }
];

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
    // Try to fetch from API, if fail use mock data
    try {
      // Intentionally verify connection first
      await axiosClient.get('/', { timeout: 1000 });
      const response = await axiosClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.warn('API Error/Offline, using in-memory mock data:', error.message);

      // Filter logic (mocking backend filtering)
      let filtered = [...mockProducts];

      // 1. Search
      if (params.search) {
        const lowerQ = params.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(lowerQ) ||
          p.description.toLowerCase().includes(lowerQ)
        );
      }

      // 2. Category
      if (params.category) {
        const lowerCat = params.category.toLowerCase();
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === lowerCat);
      }

      // 3. Price Range
      if (params.minPrice) {
        filtered = filtered.filter(p => p.price >= Number(params.minPrice));
      }
      if (params.maxPrice) {
        filtered = filtered.filter(p => p.price <= Number(params.maxPrice));
      }

      // 4. Stock Availability
      if (params.inStock === 'true' || params.inStock === true) {
        filtered = filtered.filter(p => (p.stock || 0) > 0);
      }

      // 5. Sorting
      if (params.sort) {
        switch (params.sort) {
          case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'newest':
            // Assuming higher ID is newer for mock
            filtered.sort((a, b) => b.id - a.id);
            break;
          default:
            break;
        }
      }

      // Return consistent structure
      return {
        products: filtered,
        total: filtered.length
      };
    }
  },

  /**
   * Get single product by ID
   */
  getProductById: async (id) => {
    try {
      const response = await axiosClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      const product = mockProducts.find(p => p.id === Number(id));
      if (product) return product;
      throw new Error('Product not found in mock store');
    }
  },

  /**
   * Get featured products for homepage
   */
  getFeaturedProducts: async (limit = 8) => {
    try {
      const response = await axiosClient.get('/products/featured', { params: { limit } });
      return response.data;
    } catch (error) {
      return mockProducts.slice(0, limit);
    }
  },

  /**
   * Get product categories
   */
  getCategories: async () => {
    try {
      const response = await axiosClient.get('/categories');
      return response.data;
    } catch (error) {
      return ['Toothpaste', 'Toothbrush', 'Mouthwash', 'Teethwhitening', 'Dental Floss', 'Kits'];
    }
  },

  /**
   * Search products by keyword
   */
  searchProducts: async (keyword) => {
    try {
      const response = await axiosClient.get('/products/search', {
        params: { q: keyword }
      });
      return response.data;
    } catch (error) {
      if (!keyword) return [];
      const lowerQ = keyword.toLowerCase();
      return mockProducts.filter(p => p.name.toLowerCase().includes(lowerQ));
    }
  },

  // --- Admin CRUD Operations (Stateful Mock) ---

  createProduct: async (productData) => {
    console.log('API Create Product:', productData);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newProduct = {
      id: Date.now(),
      ...productData,
      price: Number(productData.price),
      originalPrice: Number(productData.originalPrice || 0),
      stock: Number(productData.stock || 0)
    };

    mockProducts = [newProduct, ...mockProducts];
    return newProduct;
  },

  updateProduct: async (id, productData) => {
    console.log('API Update Product:', id, productData);

    await new Promise(resolve => setTimeout(resolve, 800));

    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = { ...mockProducts[index], ...productData };
      return mockProducts[index];
    }
    throw new Error('Product not found');
  },

  deleteProduct: async (id) => {
    console.log('API Delete Product:', id);

    await new Promise(resolve => setTimeout(resolve, 800));

    const initialLength = mockProducts.length;
    mockProducts = mockProducts.filter(p => p.id !== id);

    if (mockProducts.length < initialLength) {
      return { success: true };
    }
    throw new Error('Product not found or already deleted');
  }
};

export default productService;
