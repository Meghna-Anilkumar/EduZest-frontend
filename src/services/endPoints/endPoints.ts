import { UserEndpoints,AdminEndpoints } from "./IEndPoints";

export const userEndPoints: UserEndpoints = {
    signup: '/signup',
    verifyOTP: '/otp-verification',
    login: '/login',
    logout: '/logout',
    fetchUserdata:'/getUserdata',
    resendOTP:'/resend-otp',
    forgotPassword:'/forgot-pass',
    resetPassword:'/reset-password',
    updateProfile:'/student-profile'
}

export const adminEndpoints: AdminEndpoints = {
    login:'/login',
    logout:'/logout',
    getAllStudents:(page,limit)=>`fetchAllStudents?page=${page}&limit=${limit}`
}