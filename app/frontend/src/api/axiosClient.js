import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
axiosClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token if available
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401, 500)
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axiosClient;
