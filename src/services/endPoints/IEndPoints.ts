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
    switchToInstructor: string
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
        courseFilter?: string
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
    getCourseStats: string;

    //review
    addReview: string
    getReviewsByCourse: string
    getReview: string
    streamVideo: string


    // Chat
    getMessages: (courseId: string, page: number, limit: number) => string;
    sendMessage: (courseId: string) => string;
    getChatGroupMetadata: () => string

    //coupons
    fetchActiveCoupons: string;
    checkCouponUsage: string

    //subscriptions
    createSubscription: string
    confirmSubscription: string
    getSubscriptionStatus: string

    // Exams
    createExam: (courseId: string) => string;
    getExamsByCourse: (courseId: string, page: number, limit: number) => string;
    editExam: (examId: string) => string;
    deleteExam: (examId: string) => string;
    getExamsForStudent: (courseId: string, page: number, limit: number) => string;
    getExamById: (examId: string) => string;
    submitExam: (examId: string) => string;
    getExamByIdForStudent: (examId: string) => string;
    getExamResult: (examId: string) => string;
    startExam: (examId: string) => string
    getExamProgress: (examId: string) => string
    getLeaderboard:string
    getRank:string
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
        sortOrder?: "asc" | "desc",
        courseFilter?: string
    ) => string;
    dashboardStats: () => string;
    createCoupon: string;
    fetchAllCoupons: (page: number, limit: number, search?: string) => string;
    editCoupon: (couponId: string) => string;
    deleteCoupon: (couponId: string) => string;
    createOffer: string;
    fetchAllOffers: (page: number, limit: number, search?: string) => string;
    editOffer: (offerId: string) => string;
    deleteOffer: (offerId: string) => string;
}

