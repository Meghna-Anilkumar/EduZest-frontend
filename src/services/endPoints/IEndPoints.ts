export interface IEndPoints {
    login: string;
    logout: string;
}

export interface UserEndpoints extends IEndPoints {
    signup: string;
    verifyOTP: string;
    fetchUserdata: string;
    resendOTP: string;
    forgotPassword: string;
    resetPassword: string;
    updateStudentProfile: string;
    updateInstructorProfile: string;
    changePassword: string;
    googleAuth: string;
    applyInstructor: string;
    refreshToken: string;
    refreshSignedUrl: string

    //course related
    createCourse: string;
    getAllCoursesByInstructor: string;
    getAllActiveCourses: string;
    getCourseById: string;
    getCourseByInstructor: string
    editCourse: string;
    createPaymentIntent: string
    confirmPayment: string
    enrollCourse: string
    checkEnrollment: string
    enrollments: string
    getPaymentHistory: string

    //review
    addReview: string
    getReviewsByCourse: string
    getReview: string
    streamVideo:string
}

export interface AdminEndpoints extends IEndPoints {
    getAllStudents: (page: number, limit: number, search?: string) => string;
    blockUnblockUser: (userId: string) => string;
    fetchAllRequestedUsers: (page: number, limit: number) => string;
    approveInstructor: (userId: string) => string;
    rejectInstructor: (userId: string) => string;
    createCategory: string;
    fetchAllCategories: (page: number, limit: number, search?: string) => string;
    editCategory: (categoryId: string) => string;
    deleteCategory: (categoryId: string) => string;
    getAllInstructors: (page: number, limit: number, search?: string) => string;
    getInstructorRequestDetails: (userId: string) => string;
}

