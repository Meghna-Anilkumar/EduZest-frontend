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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

const handleSuccess = <T>(response: AxiosResponse<T>): AxiosResponse<T> => {
  return response;
};

const handleError = async (
  error: AxiosError<{ message?: string; logout?: boolean }>
): Promise<AxiosResponse> => {
  const originalRequest = error.config as (InternalAxiosRequestConfig & {
    _retry?: boolean;
  }) | undefined;

  // Skip refresh token endpoint itself to avoid infinite loop
  if (originalRequest?.url?.includes('/refresh-token')) {
    console.error("Refresh token request failed, redirecting to login");
    isRefreshing = false;
    processQueue(error);
    window.location.href = "/login";
    return Promise.reject(error);
  }

  if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise<AxiosResponse>((resolve, reject) => {
        failedQueue.push({ 
          resolve: (value?: unknown) => resolve(value as AxiosResponse), 
          reject 
        });
      })
        .then(() => {
          return axios(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await serverUser.post<{ success: boolean; message?: string }>(
        "/refresh-token"
      );

      if (refreshResponse.data.success) {
        isRefreshing = false;
        processQueue(null);
        return axios(originalRequest);
      } else {
        console.error("Token refresh failed:", refreshResponse.data.message);
        isRefreshing = false;
        processQueue(error);
        window.location.href = "/login";
        return Promise.reject(error);
      }
    } catch (refreshError) {
      console.error("Error during token refresh:", refreshError);
      isRefreshing = false;
      processQueue(error);
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  }

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

  if (error.response?.status === 500) {
    console.error("Server error. Please try again later.");
  }

  return Promise.reject(error);
};

const attachInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(handleSuccess, handleError);
};

[serverInstance, serverUser, serverAdmin].forEach(attachInterceptors);