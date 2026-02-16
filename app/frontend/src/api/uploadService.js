import axiosClient from './axiosClient';

const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axiosClient.post('/upload', formData);
    return response.data; // { status: 'success', data: { url: '...', filename: '...' } }
  },

  uploadMultiple: async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await axiosClient.post('/upload/multiple', formData);
    return response.data;
  }
};

export default uploadService;
