import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminEndpoints } from "../../services/endPoints/endPoints";
import { serverAdmin } from "../../services";
import { AxiosError } from "axios";

// Define response interfaces
interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    instructors?: T[];
    students?: T[];
    requestedUsers?: T[];
    totalPages: number;
    currentPage: number;
    totalCount: number;
  };
}

interface BlockUnblockResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    isBlocked: boolean;
  };
}

interface ApproveRejectResponse {
  success: boolean;
  message: string;
}

interface AdminPayoutItem {
  transactionId: string;
  date: string;
  course: string;
  studentName: string;
  amount: string;
}


interface AdminPayoutsResponse {
  success: boolean;
  message?: string;
  data: {
    data: AdminPayoutItem[]; 
    total: number;
    limit: number;
    page: number;
  };
}

interface DashboardStats {
  totalStudents: number;
  totalInstructors: number;
  activeCourses: number;
  totalRevenue: number;
  studentGrowth: { date: string; count: number }[];
  revenueOverview: { date: string; amount: number }[];
  topEnrolledCourses: {
    courseId: string;
    courseName: string;
    enrollmentCount: number;
    instructorName: string;
    thumbnail: string;
  }[];
}

interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
}

// User/Instructor base interface (shared)
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  status?: string;
  // Add more fields if needed (e.g., profile, createdAt)
}

// Fetch all students
export const getAllStudentsAction = createAsyncThunk<
  PaginatedResponse<AdminUser>,
  { page: number; limit: number; search?: string },
  { rejectValue: { message: string } }
>(
  "admin/getAllStudents",
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      const url = adminEndpoints.getAllStudents(page, limit, search);
      console.log("Fetching students with URL:", url);
      const response = await serverAdmin.get<PaginatedResponse<AdminUser>>(url);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch students";
      return rejectWithValue({ message });
    }
  }
);

// Block/Unblock User
export const blockUnblockUserAction = createAsyncThunk<
  BlockUnblockResponse,
  { userId: string; isBlocked: boolean },
  { rejectValue: { message: string } }
>(
  "admin/blockUnblockUser",
  async ({ userId, isBlocked }, { rejectWithValue }) => {
    try {
      const response = await serverAdmin.put<BlockUnblockResponse>(
        adminEndpoints.blockUnblockUser(userId),
        { isBlocked: !isBlocked }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to update user status";
      return rejectWithValue({ message });
    }
  }
);

// Fetch all requested users (instructor applications)
export const getAllRequestedUsersAction = createAsyncThunk<
  PaginatedResponse<AdminUser>,
  { page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "admin/getAllRequestedUsers",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await serverAdmin.get<PaginatedResponse<AdminUser>>(
        adminEndpoints.fetchAllRequestedUsers(page, limit)
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to fetch requested users";
      return rejectWithValue({ message });
    }
  }
);

// Approve instructor
export const approveInstructorAction = createAsyncThunk<
  ApproveRejectResponse,
  { userId: string },
  { rejectValue: { message: string } }
>(
  "admin/approveInstructor",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const response = await serverAdmin.patch<ApproveRejectResponse>(
        adminEndpoints.approveInstructor(userId)
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to approve instructor";
      return rejectWithValue({ message });
    }
  }
);

// Reject instructor
export const rejectInstructorAction = createAsyncThunk<
  ApproveRejectResponse,
  { userId: string; message: string },
  { rejectValue: { message: string } }
>(
  "admin/rejectInstructor",
  async ({ userId, message }, { rejectWithValue }) => {
    try {
      const response = await serverAdmin.patch<ApproveRejectResponse>(
        adminEndpoints.rejectInstructor(userId),
        { message }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to reject instructor";
      return rejectWithValue({ message });
    }
  }
);

// Fetch all instructors ← This is the one used in your component
export const getAllInstructorsAction = createAsyncThunk<
  PaginatedResponse<AdminUser>,
  { page: number; limit: number; search?: string },
  { rejectValue: { message: string } }
>(
  "admin/getAllInstructors",
  async ({ page, limit, search }, { rejectWithValue }) => {
    try {
      const url = adminEndpoints.getAllInstructors(page, limit, search);
      const response = await serverAdmin.get<PaginatedResponse<AdminUser>>(url);
      console.log("Action response:", response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to fetch instructors";
      return rejectWithValue({ message });
    }
  }
);

// Admin payouts
export const getAdminPayoutsAction = createAsyncThunk<
  AdminPayoutsResponse,
  {
    page: number;
    limit: number;
    search?: string;
    sortField?: string;
    sortOrder?: "asc" | "desc";
    courseFilter?: string;
  },
  { rejectValue: { message: string } }
>(
  "admin/getAdminPayouts",
  async (
    { page, limit, search, sortField, sortOrder, courseFilter },
    { rejectWithValue }
  ) => {
    try {
      const url = adminEndpoints.getAdminPayouts(
        page,
        limit,
        search,
        sortField,
        sortOrder,
        courseFilter
      );
      const response = await serverAdmin.get<AdminPayoutsResponse>(url);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to fetch admin payouts";
      return rejectWithValue({ message });
    }
  }
);

// Dashboard stats
export const getDashboardStatsAction = createAsyncThunk<
  DashboardResponse,
  { period?: "day" | "month" | "year" },
  { rejectValue: { message: string } }
>(
  "admin/getDashboardStats",
  async ({ period = "day" }, { rejectWithValue }) => {
    try {
      const url = adminEndpoints.dashboardStats();
      const response = await serverAdmin.get<DashboardResponse>(url, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Failed to fetch dashboard stats";
      return rejectWithValue({ message });
    }
  }
);