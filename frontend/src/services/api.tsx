import axios from 'axios';
import {
  getStoredToken,
  setStoredToken,
} from '../utils/AuthHelpers/tokenStorage';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/refresh`,
      null,
      {
        withCredentials: true,
      }
    );
    const { accessToken } = response.data;

    // Whichever storage already held a token for this session is the one
    // that should keep holding it - a silent refresh shouldn't change
    // whether the session persists across browser restarts.
    const rememberMe = !!localStorage.getItem('accessToken');
    setStoredToken(accessToken, rememberMe);
    return accessToken;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

instance.interceptors.request.use(
  (config) => {
    const accessToken = getStoredToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
