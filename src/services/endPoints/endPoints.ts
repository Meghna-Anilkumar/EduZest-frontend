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
    updateStudentProfile:'/student-profile',
    updateInstructorProfile:'/instructor-profile',
    changePassword:'/change-password',
    googleAuth:'/google-auth',
    applyInstructor:'/instructor-apply'
}

export const adminEndpoints: AdminEndpoints = {
    login: '/login',
    logout: '/logout',
    getAllStudents: (page, limit) => `/fetchAllStudents?page=${page}&limit=${limit}`,
    blockUnblockUser: (userId: string) => `/block-unblock/${userId}`,
    fetchAllRequestedUsers: (page, limit) => `/fetchAllRequestedUsers?page=${page}&limit=${limit}`,
    approveInstructor: (userId: string) => `/approve-instructor/${userId}`,
    rejectInstructor: (userId: string) => `/reject-instructor/${userId}`,
    createCategory: '/create-category',
    fetchAllCategories: '/fetch-all-categories',
    editCategory: (categoryId: string) => `/edit-category/${categoryId}`,
    deleteCategory: (categoryId: string) => `/delete-category/${categoryId}`,
    getAllInstructors: (page: number, limit: number) => `/fetchAllInstructors?page=${page}&limit=${limit}`,
};
