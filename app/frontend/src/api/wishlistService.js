import axiosClient from './axiosClient';

const wishlistService = {
  getWishlist: async () => {
    const response = await axiosClient.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await axiosClient.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await axiosClient.delete(`/wishlist/${productId}`);
    return response.data;
  },

  checkStatus: async (productId) => {
    const response = await axiosClient.get(`/wishlist/${productId}/status`);
    return response.data;
  }
};

export default wishlistService;
