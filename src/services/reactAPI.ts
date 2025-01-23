import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';


const onResponse = (response: AxiosResponse): AxiosResponse => {
    return response
}

const onResponseError = (error: AxiosError): Promise<AxiosError> => {
    if (error.response?.status === 401) {
        console.error('Unauthorized access: Please log in.');

    } else if (error.response?.status === 500) {
        console.error('Server error: Please try again later.');
    }

    return Promise.reject(error);
}

const {
    VITE_API_URL,
    VITE_API_URL_USERS,
    VITE_API_URL_ADMIN,

} = import.meta.env


const API_URL = VITE_API_URL || 'http://localhost:8080'
const API_URL_USERS = VITE_API_URL_USERS || 'http://localhost:8080/users'
const API_URL_ADMIN = VITE_API_URL_ADMIN || 'http://localhost:8080/admin'


export const serverInstance = axios.create({
    withCredentials: true,
    baseURL: API_URL
})

export const serverUser = axios.create({
    withCredentials: true,
    baseURL: API_URL_USERS,
    timeout: 10000
})

export const serverAdmin = axios.create({
    withCredentials: true,
    baseURL: API_URL_ADMIN
})

setupInterceptorsTo(serverUser)

function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.response.use(onResponse, (error: AxiosError) => onResponseError(error))
    return axiosInstance;
}


// export function debounce(func: Function, delay: number) {
//     let timeout: ReturnType<typeof setTimeout>;

//     return function (...args: any[]) {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => func(...args), delay);
//     };
// }