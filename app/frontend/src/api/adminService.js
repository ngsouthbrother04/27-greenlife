import axiosClient from './axiosClient';

const adminService = {
  getStats: () => {
    return axiosClient.get('/admin/stats');
  },
};

export default adminService;
