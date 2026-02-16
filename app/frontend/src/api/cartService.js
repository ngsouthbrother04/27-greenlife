import axiosClient from './axiosClient';

const cartService = {
  getCart: async () => {
    const response = await axiosClient.get('/cart');
    return response.data; // { status: 'success', data: { cart } }
  },

  addToCart: async (productId, quantity) => {
    const response = await axiosClient.post('/cart', { productId, quantity });
    return response.data;
  },

  bulkAddToCart: async (items) => {
    // items: [{ productId, quantity }]
    const response = await axiosClient.post('/cart/bulk', { items });
    return response.data;
  },

  updateCartItem: async (productId, quantity) => {
    const response = await axiosClient.put('/cart', { productId, quantity });
    return response.data;
  },

  removeCartItem: async (productId) => {
    const response = await axiosClient.delete(`/cart/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosClient.delete('/cart');
    return response.data;
  }
};

export default cartService;
