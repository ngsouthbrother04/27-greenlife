import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    // 'Content-Type': 'application/json', // Let Axios/Browser handle this matches the payload (JSON vs FormData)
  },
});

// Interceptors
axiosClient.interceptors.request.use(
  (config) => {
    // If Authorization header is already set (e.g. by authStore), don't overwrite it
    if (config.headers.Authorization) {
      return config;
    }

    // Otherwise try to get token from localStorage (managed by Zustand persist)
    try {
      const authStorage = localStorage.getItem('greenlife-auth');
      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state && state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401, 500)
    if (error.response && error.response.status === 401) {
      // Optional: Redirect to login or clear auth
      // window.location.href = '/login'; 
      // But better to handle in UI components or AuthContext
    }
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
