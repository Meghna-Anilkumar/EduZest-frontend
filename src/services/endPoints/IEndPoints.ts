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
    getInstructorPayouts: (
        page: number,
        limit: number,
        search?: string,
        sortField?: string,
        sortOrder?: "asc" | "desc",
        instructorId?: string
    ) => string;
    createAssessment: (courseId: string, moduleTitle: string) => string;
    getAssessmentsByCourseAndModule: (courseId: string, moduleTitle: string, page: number, limit: number) => string;
    editAssessment: (id: string) => string;
    deleteAssessment: (id: string) => string;
    getAssessmentsForStudent: (
        courseId: string,
        moduleTitle: string,
        page: number,
        limit: number
    ) => string;

    getAssessmentById: (assessmentId: string) => string;
    getAssessmentByIdForStudent: (assessmentId: string) => string;
    submitAssessment: (assessmentId: string) => string;
    getAssessmentResult: (assessmentId: string) => string;
    getCourseProgress: (courseId: string) => string
    getAllAssessmentsForCourse: (courseId: string, page: number, limit: number) => string;

    //review
    addReview: string
    getReviewsByCourse: string
    getReview: string
    streamVideo: string
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
    getAdminPayouts: (
        page: number,
        limit: number,
        search?: string,
        sortField?: string,
        sortOrder?: "asc" | "desc"
      ) => string;
    dashboardStats:()=>string
}

