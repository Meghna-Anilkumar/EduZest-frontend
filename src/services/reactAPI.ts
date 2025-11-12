import axios, {AxiosInstance,AxiosResponse,AxiosError,InternalAxiosRequestConfig,} from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_URL_USERS =import.meta.env.VITE_API_URL_USERS || "http://localhost:8080/users";
const API_URL_ADMIN =import.meta.env.VITE_API_URL_ADMIN || "http://localhost:8080/admin";

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


const handleSuccess = <T>(response: AxiosResponse<T>): AxiosResponse<T> => {
  return response;
};


const handleError = async (
  error: AxiosError
): Promise<AxiosResponse | never> => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

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
          return axios(originalRequest);
        } else {
          console.error("Refresh failed:", refreshResponse.data.message);
          window.location.href = "/login";
        }
      } catch (refreshError) {
        console.error("Error during refresh:", refreshError);
        isRefreshing = false;
        window.location.href = "/login";
      }
    }
  }

  if (error.response?.status === 403) {
    if ((error.response.data as { logout?: boolean })?.logout) {
      console.error("Account blocked. Logging out.");
      window.location.href = "/login";
    } else {
      console.error("You don't have permission for this.");
    }
  }

  if (error.response?.status === 500) {
    console.error("Server problem. Try again later.");
  }

  throw error;
};


const attachInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.response.use(handleSuccess, handleError);
};

[serverInstance, serverUser, serverAdmin].forEach(attachInterceptors);