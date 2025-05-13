import axios from 'axios';

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

    localStorage.setItem('accessToken', accessToken);
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
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
