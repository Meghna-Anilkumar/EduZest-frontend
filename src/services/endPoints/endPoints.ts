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
  createPaymentIntent: 'student/create-payment-intent',
  confirmPayment: 'student/confirm-payment',
  enrollCourse: 'student/enroll-course',
  checkEnrollment: 'student/check-enrollment',
  enrollments: '/student/enrollments',
  getPaymentHistory: "student/payment-history",

  //reviews
  addReview:'student/reviews'
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
};
