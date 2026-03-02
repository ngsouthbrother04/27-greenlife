import axiosClient from './axiosClient';

const adminService = {
  getStats: (range = '30d') => {
    return axiosClient.get(`/admin/stats?range=${range}`);
  },
};

export default adminService;
