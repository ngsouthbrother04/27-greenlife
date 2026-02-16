import axiosClient from './axiosClient';

const userService = {
  getProfile: async () => {
    const response = await axiosClient.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosClient.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axiosClient.put('/users/change-password', data);
    return response.data;
  },

  getAddresses: async () => {
    const response = await axiosClient.get('/users/addresses');
    return response.data;
  },

  addAddress: async (data) => {
    const response = await axiosClient.post('/users/addresses', data);
    return response.data;
  },

  updateAddress: async (id, data) => {
    const response = await axiosClient.put(`/users/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id) => {
    const response = await axiosClient.delete(`/users/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id) => {
    const response = await axiosClient.put(`/users/addresses/${id}/default`);
    return response.data;
  }
};

export default userService;
