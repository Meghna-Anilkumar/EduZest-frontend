import { UserEndpoints, AdminEndpoints } from "./IEndPoints";

export const userEndPoints: UserEndpoints = {
  signup: '/signup',
  verifyOTP: '/otp-verification',
  login: '/login',
  logout: '/logout',
  fetchUserdata: '/getUserdata',
  resendOTP: '/resend-otp',
  forgotPassword: '/forgot-pass',
  resetPassword: '/reset-password',
  updateStudentProfile: '/student-profile',
  updateInstructorProfile: '/instructor-profile',
  changePassword: '/change-password',
  googleAuth: '/google-auth',
  applyInstructor: '/instructor-apply',
  switchToInstructor: '/switch-to-instructor',
  refreshToken: '/refresh-token',
  refreshSignedUrl: '/refresh-signed-url',

  //course related
  createCourse: '/instructor/create-course',
  getAllCoursesByInstructor: '/instructor/courses',
  getAllActiveCourses: '/active-courses',
  getCourseById: '/courses',
  editCourse: '/instructor/courses/:id',
  getCourseByInstructor: '/instructor/courses/:id',
  createPaymentIntent: 'student/create-payment-intent',
  confirmPayment: 'student/confirm-payment',
  enrollCourse: 'student/enroll-course',
  checkEnrollment: 'student/check-enrollment',
  enrollments: '/student/enrollments',
  getPaymentHistory: "student/payment-history",
  streamVideo: "/courses/:courseId/stream",
  getInstructorPayouts: (
    page: number,
    limit: number,
    search?: string,
    sortField?: string,
    sortOrder?: "asc" | "desc",
    courseFilter?: string
  ) => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(sortField && { sortField }),
      ...(sortOrder && { sortOrder }),
      ...(courseFilter && { courseFilter: encodeURIComponent(courseFilter) }),
    }).toString();
    return `/instructor/getTransactions?${query}`;
  },
  getCourseStats: '/instructor/course-stats',



  //assessments
  createAssessment: (courseId: string, moduleTitle: string) =>
    `/instructor/courses/${courseId}/modules/${encodeURIComponent(moduleTitle)}/assessments`,
  getAssessmentsByCourseAndModule: (courseId: string, moduleTitle: string, page: number, limit: number) =>
    `/instructor/courses/${courseId}/modules/${encodeURIComponent(moduleTitle)}/assessments?page=${page}&limit=${limit}`,
  editAssessment: (assessmentId: string) => `/instructor/assessments/${assessmentId}`,
  deleteAssessment: (assessmentId: string) => `/instructor/assessments/${assessmentId}`,
  getAssessmentsForStudent: (
    courseId: string,
    moduleTitle: string,
    page: number,
    limit: number
  ) =>
    `/student/courses/${courseId}/modules/${encodeURIComponent(moduleTitle)}/assessments?page=${page}&limit=${limit}`,
  getAssessmentById: (assessmentId: string) => `/assessments/${assessmentId}`,
  submitAssessment: (assessmentId: string) => `/student/assessments/${assessmentId}/submit`,
  getAssessmentByIdForStudent: (assessmentId: string) => `student/assessments/${assessmentId}`,
  getAssessmentResult: (assessmentId: string) => `/student/assessments/${assessmentId}/result`,
  getCourseProgress: (courseId: string) =>
    `/student/courses/${courseId}/progress`,
  getAllAssessmentsForCourse: (courseId: string, page: number, limit: number) =>
    `/student/courses/${courseId}/assessments?page=${page}&limit=${limit}`,

  //reviews
  addReview: 'student/reviews',
  getReviewsByCourse: "/courses/:courseId/reviews",
  getReview: "student/review/:courseId",


  //chat
  getMessages: (courseId: string, page: number, limit: number) =>
    `/${courseId}/messages?page=${page}&limit=${limit}`,
  sendMessage: (courseId: string) => `/${courseId}/messages`,
  getChatGroupMetadata: () => `/metadata`,

  //coupons
  fetchActiveCoupons: '/activeCoupons',
  checkCouponUsage: "/check-coupon-usage",

  //subscriptions
  createSubscription: '/student/subscriptions/create',
  confirmSubscription: '/student/subscriptions/confirm',
  getSubscriptionStatus: '/student/subscriptions/status',

  // Exams
  createExam: (courseId: string) => `/instructor/courses/${courseId}/exams`,
  getExamsByCourse: (courseId: string, page: number, limit: number) =>
    `/instructor/courses/${courseId}/exams?page=${page}&limit=${limit}`,
  editExam: (examId: string) => `/instructor/exams/${examId}`,
  deleteExam: (examId: string) => `/instructor/exams/${examId}`,
  getExamsForStudent: (courseId: string, page: number, limit: number) =>
    `/student/courses/${courseId}/exams?page=${page}&limit=${limit}`,
  getExamById: (examId: string) => `/student/exams/${examId}`,
  submitExam: (examId: string) => `/student/exams/${examId}/submit`,
  getExamByIdForStudent: (examId: string) => `/student/exams/${examId}/details`,
  getExamResult: (examId: string) => `/student/exams/${examId}/result`,

}


export const adminEndpoints: AdminEndpoints = {
  login: '/login',
  logout: '/logout',
  getAllStudents: (page: number, limit: number, search?: string) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    return `/fetchAllStudents?${queryParams.toString()}`;
  },
  blockUnblockUser: (userId: string) => `/block-unblock/${userId}`,
  fetchAllRequestedUsers: (page, limit) => `/fetchAllRequestedUsers?page=${page}&limit=${limit}`,
  approveInstructor: (userId: string) => `/approve-instructor/${userId}`,
  rejectInstructor: (userId: string) => `/reject-instructor/${userId}`,
  createCategory: '/create-category',
  fetchAllCategories: (page: number, limit: number, search?: string) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    return `/fetch-all-categories?${queryParams.toString()}`;
  },
  editCategory: (categoryId: string) => `/edit-category/${categoryId}`,
  deleteCategory: (categoryId: string) => `/delete-category/${categoryId}`,
  getAllInstructors: (page: number, limit: number, search?: string) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    return `/fetchAllInstructors?${queryParams.toString()}`;
  },
  getInstructorRequestDetails: (userId: string) => `/get-instructor-request-details/${userId}`,
  getAdminPayouts: (
    page: number,
    limit: number,
    search?: string,
    sortField?: string,
    sortOrder?: "asc" | "desc",
    courseFilter?: string
  ) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    if (sortField) {
      queryParams.append("sortField", sortField);
    }
    if (sortOrder) {
      queryParams.append("sortOrder", sortOrder);
    }
    if (courseFilter) {
      queryParams.append("courseFilter", encodeURIComponent(courseFilter));
    }
    return `/getTransactions?${queryParams.toString()}`;
  },
  dashboardStats: () => `/dashboard-stats`,
  createCoupon: '/create-coupon',
  fetchAllCoupons: (page: number, limit: number, search?: string) => {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      queryParams.append("search", search);
    }
    return `/fetch-all-coupons?${queryParams.toString()}`;
  },
  editCoupon: (couponId: string) => `/edit-coupon/${couponId}`,
  deleteCoupon: (couponId: string) => `/delete-coupon/${couponId}`,


  createOffer: "/create-offer",
  fetchAllOffers: (page: number, limit: number, search?: string) =>
    `/offers?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`,
  editOffer: (offerId: string) => `/edit-offer/${offerId}`,
  deleteOffer: (offerId: string) => `/delete-offer/${offerId}`,
};
