import { UserEndpoints,AdminEndpoints } from "./IEndPoints";

export const userEndPoints: UserEndpoints = {
    signup: '/signup',
    verifyOTP: '/otp-verification',
    login: '/login',
    logout: '/logout'
}

export const adminEndpoints: AdminEndpoints = {
    login:'/login',
    logout:'/logout'
}