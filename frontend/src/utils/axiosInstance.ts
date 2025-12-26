// utils/axiosInstance.ts
import axios from 'axios';

const apiKey = import.meta.env.VITE_API_KEY;
const baseURL ='https://api.bhaobhao.in' ;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey ?? '',
  },
});

// Request interceptor (you already had this)
axiosInstance.interceptors.request.use((config) => {
  const token =
    // typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const skipAuthPaths = ['/auth/sendOTP', '/auth/verifyOTP'];
  const url = config.url || '';
  const shouldSkipAuth = skipAuthPaths.some((path) => url.includes(path));

  config.headers = config.headers ?? {};

  if (!shouldSkipAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Response interceptor for handling 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error:', error);
    // Handle 401 error
    if (error.response?.status === 401) {
      // Clear session
      // sessionStorage.removeItem('token');
      // sessionStorage.removeItem('bhaobhao_user');
      // sessionStorage.removeItem('demo_bookings');
      localStorage.removeItem('token');
      localStorage.removeItem('bhaobhao_user');
      localStorage.removeItem('demo_bookings');

      // Optionally redirect to login
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
