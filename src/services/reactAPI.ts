import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_URL_USERS = import.meta.env.VITE_API_URL_USERS || 'http://localhost:8080/users';
const API_URL_ADMIN = import.meta.env.VITE_API_URL_ADMIN || 'http://localhost:8080/admin';

// Interface for better type safety
interface CustomAxiosError extends AxiosError {
  config: any;
  response?: AxiosResponse;
}

// Shared state for token refresh
interface RefreshState {
  isRefreshing: boolean;
  refreshPromise: Promise<AxiosResponse> | null;
}

// Initialize refresh state
const refreshState: RefreshState = {
  isRefreshing: false,
  refreshPromise: null,
};

// Function to configure interceptors for an Axios instance
const configureInterceptors = (instance: AxiosInstance) => {
  const handleSuccess = (response: AxiosResponse) => {
    return response;
  };

  const handleError = async (error: CustomAxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshState.isRefreshing) {
        refreshState.isRefreshing = true;
        refreshState.refreshPromise = instance.post('/refresh-token');

        try {
          const refreshResponse = await refreshState.refreshPromise;

          if (refreshResponse.data.success) {
            refreshState.isRefreshing = false;
            refreshState.refreshPromise = null;
            return instance(originalRequest);
          } else {
            console.error('Refresh failed:', refreshResponse.data.message);
            window.location.href = '/login';
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('Error during refresh:', refreshError);
          refreshState.isRefreshing = false;
          refreshState.refreshPromise = null;
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else if (refreshState.refreshPromise) {
        // Wait for the ongoing refresh to complete
        try {
          await refreshState.refreshPromise;
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response?.status === 403) {
      if (error.response.data?.logout) {
        console.error('Account blocked. Logging out.');
        window.location.href = '/login';
      } else {
        console.error('You don’t have permission for this.');
      }
    }

    if (error.response?.status === 500) {
      console.error('Server problem. Try again later.');
    }

    return Promise.reject(error);
  };

  instance.interceptors.response.use(handleSuccess, handleError);
};

// Create Axios instances
export const serverInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const serverUser = axios.create({
  baseURL: API_URL_USERS,
  withCredentials: true,
});

export const serverAdmin = axios.create({
  baseURL: API_URL_ADMIN,
  withCredentials: true,
});

configureInterceptors(serverInstance);
configureInterceptors(serverUser);
configureInterceptors(serverAdmin);