import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_URL_USERS =
  import.meta.env.VITE_API_URL_USERS || "http://localhost:8080/users";
const API_URL_ADMIN =
  import.meta.env.VITE_API_URL_ADMIN || "http://localhost:8080/admin";

// Create Axios instances
export const serverInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const serverUser: AxiosInstance = axios.create({
  baseURL: API_URL_USERS,
  withCredentials: true,
});

export const serverAdmin: AxiosInstance = axios.create({
  baseURL: API_URL_ADMIN,
  withCredentials: true,
});

// Shared flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;

// Generic success handler
const handleSuccess = <T>(response: AxiosResponse<T>): AxiosResponse<T> => {
  return response;
};

// Enhanced error handler with proper typing
const handleError = async (
  error: AxiosError<{ message?: string; logout?: boolean }>
): Promise<never> => {
  const originalRequest = error.config as (InternalAxiosRequestConfig & {
    _retry?: boolean;
  }) | undefined;

  // Handle 401 Unauthorized - Token expired
  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResponse = await serverUser.post<{ success: boolean; message?: string }>(
          "/refresh-token"
        );

        isRefreshing = false;

        if (refreshResponse.data.success) {
          // Retry the original request with new token (cookie updated via httpOnly)
          return axios(originalRequest);
        } else {
          console.error("Token refresh failed:", refreshResponse.data.message);
          window.location.href = "/login";
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
        isRefreshing = false;
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // If another request is already refreshing, just wait and retry
    // Note: In a production app with many concurrent requests, you'd queue them.
    // This simple version just rejects if refresh is in progress.
    return Promise.reject(error);
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    const data = error.response.data;
    if (data?.logout) {
      console.error("Account blocked or session invalidated. Logging out.");
      window.location.href = "/login";
    } else {
      console.error("Access denied: Insufficient permissions.");
    }
    return Promise.reject(error);
  }

  // Handle 500 Internal Server Error
  if (error.response?.status === 500) {
    console.error("Server error. Please try again later.");
  }

  // For all other errors, reject
  return Promise.reject(error);
};

// Attach interceptors to all instances
const attachInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(handleSuccess, handleError);
};

[serverInstance, serverUser, serverAdmin].forEach(attachInterceptors);