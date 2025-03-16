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


function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
    axiosInstance.interceptors.response.use(onResponse, (error: AxiosError) => onResponseError(error))
    return axiosInstance;
}


setupInterceptorsTo(serverInstance);
setupInterceptorsTo(serverUser);
setupInterceptorsTo(serverAdmin);





// import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
// import cookies from 'js-cookie';

// const onResponse = (response: AxiosResponse): AxiosResponse => {
//     console.log("Response:", response.status, response.data);
//     return response;
// };

// const onResponseError = (error: AxiosError): Promise<AxiosError> => {
//     console.log("Error Response:", error.response?.status, error.response?.data);
//     if (error.response?.status === 401) {
//         cookies.remove('userJWT', { path: '/', secure: import.meta.env.PROD });
//         console.error('Unauthorized access: Please log in.');
//         window.location.href = '/login';
//     } else if (error.response?.status === 403) {
//         const responseData = error.response.data as { success?: boolean; message?: string; logout?: boolean };
//         console.log("403 Data:", responseData);
//         if (responseData?.logout) {
//             cookies.remove('userJWT', {
//                 path: '/',
//                 secure: import.meta.env.PROD,
//                 sameSite: 'strict',
//             });
//             console.error('Account blocked: Logged out.', responseData.message);
//             window.location.href = '/login';
//         } else {
//             console.error('Forbidden: Insufficient permissions.', responseData?.message);
//         }
//     } else if (error.response?.status === 500) {
//         console.error('Server error: Please try again later.', error.response?.data?.message);
//     }

//     return Promise.reject(error);
// };

// const {
//     VITE_API_URL,
//     VITE_API_URL_USERS,
//     VITE_API_URL_ADMIN,
// } = import.meta.env;

// const API_URL = VITE_API_URL || 'http://localhost:8080';
// const API_URL_USERS = VITE_API_URL_USERS || 'http://localhost:8080/users';
// const API_URL_ADMIN = VITE_API_URL_ADMIN || 'http://localhost:8080/admin';

// export const serverInstance = axios.create({
//     withCredentials: true,
//     baseURL: API_URL,
// });

// export const serverUser = axios.create({
//     withCredentials: true,
//     baseURL: API_URL_USERS,
//     timeout: 10000,
// });

// export const serverAdmin = axios.create({
//     withCredentials: true,
//     baseURL: API_URL_ADMIN,
// });

// function setupInterceptorsTo(axiosInstance: AxiosInstance): AxiosInstance {
//     axiosInstance.interceptors.response.use(onResponse, (error: AxiosError) => onResponseError(error));
//     return axiosInstance;
// }

// setupInterceptorsTo(serverInstance);
// setupInterceptorsTo(serverUser);
// setupInterceptorsTo(serverAdmin);