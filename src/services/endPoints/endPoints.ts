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
    instructorId?: string
  ) => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(sortField && { sortField }),
      ...(sortOrder && { sortOrder }),
      ...(instructorId && { instructorId }),
    }).toString();
    return `instructor/getTransactions?${query}`;
  },


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
  getAssessmentResult:(assessmentId:string)=>`/student/assessments/${assessmentId}/result`,
  getCourseProgress: (courseId: string) =>
    `/student/courses/${courseId}/progress`,
  getAllAssessmentsForCourse: (courseId: string, page: number, limit: number) =>
    `/student/courses/${courseId}/assessments?page=${page}&limit=${limit}`,

  //reviews
  addReview: 'student/reviews',
  getReviewsByCourse: "/courses/:courseId/reviews",
  getReview: "student/review/:courseId",


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
    sortOrder?: "asc" | "desc"
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
    return `/getTransactions?${queryParams.toString()}`;
  },
  dashboardStats: () => `/dashboard-stats`,
};
