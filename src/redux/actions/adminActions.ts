import { createAsyncThunk } from "@reduxjs/toolkit";
// import { ResponseData } from "../../interface/Interface";
import { adminEndpoints } from "../../services/endPoints/endPoints";
import { serverAdmin } from "../../services";
import { AxiosError } from "axios";


//fetch all students
export const getAllStudentsAction = createAsyncThunk(
    "admin/getAllStudents",
    async (
      { page, limit, search }: { page: number; limit: number; search?: string },
      { rejectWithValue }
    ) => {
      try {
        const url = adminEndpoints.getAllStudents(page, limit, search);
        console.log("Fetching students with URL:", url); 
        const response = await serverAdmin.get(url);
        return response.data;
      } catch (error: any) {
        console.log("Get students action Error: ", error);
        const e: AxiosError = error as AxiosError;
        return rejectWithValue(e.response?.data || e.message);
      }
    }
  );

// Block/Unblock User Thunk
export const blockUnblockUserAction = createAsyncThunk(
    "admin/blockUnblockUser",
    async ({ userId, isBlocked }: { userId: string; isBlocked: boolean }, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.put(adminEndpoints.blockUnblockUser(userId), { isBlocked: !isBlocked });
            return response.data;
        } catch (error: any) {
            console.error("Block/Unblock action Error: ", error);
            const e: AxiosError = error as AxiosError;
            return rejectWithValue(e.response?.data || e.message);
        }
    }
);


// Fetch all requested users
export const getAllRequestedUsersAction = createAsyncThunk(
    "admin/getAllRequestedUsers",
    async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.get(adminEndpoints.fetchAllRequestedUsers(page, limit));
            console.log('Action response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error("Get requested users action Error: ", error);
            const e: AxiosError = error as AxiosError;
            return rejectWithValue(e.response?.data || e.message);
        }
    }
);


//approve instructor
export const approveInstructorAction = createAsyncThunk(
    "admin/approveInstructor",
    async ({ userId }: { userId: string }, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.patch(adminEndpoints.approveInstructor(userId));
            return response.data;
        } catch (error: any) {
            console.error("Approve instructor action Error: ", error);
            const e: AxiosError = error as AxiosError;
            return rejectWithValue(e.response?.data || e.message);
        }
    }
);

// Reject Instructor Thunk
export const rejectInstructorAction = createAsyncThunk(
    "admin/rejectInstructor",
    async ({ userId, message }: { userId: string; message: string }, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.patch(adminEndpoints.rejectInstructor(userId), { message });
            return response.data;
        } catch (error: any) {
            console.error("Reject instructor action Error: ", error);
            const e: AxiosError = error as AxiosError;
            return rejectWithValue(e.response?.data || e.message);
        }
    }
);


// Fetch all instructors
export const getAllInstructorsAction = createAsyncThunk(
    "admin/getAllInstructors",
    async (
      { page, limit, search }: { page: number; limit: number; search?: string }, 
      { rejectWithValue }
    ) => {
      try {
        const response = await serverAdmin.get(
          adminEndpoints.getAllInstructors(page, limit, search)
        );
        console.log("Action response:", response.data); // Debug log
        return response.data;
      } catch (error: any) {
        console.error("Get instructors action Error: ", error);
        const e: AxiosError = error as AxiosError;
        return rejectWithValue(e.response?.data || e.message);
      }
    }
  );


  export const getAdminPayoutsAction = createAsyncThunk(
    "admin/getAdminPayouts",
    async (
      { 
        page, 
        limit, 
        search, 
        sortField, 
        sortOrder 
      }: { 
        page: number; 
        limit: number; 
        search?: string; 
        sortField?: string; 
        sortOrder?: "asc" | "desc" 
      }, 
      { rejectWithValue }
    ) => {
      try {
        const url = adminEndpoints.getAdminPayouts(page, limit, search, sortField, sortOrder);
        console.log("Fetching admin payouts with URL:", url);
        const response = await serverAdmin.get(url);
        console.log("Action response:", response.data);
        return response.data;
      } catch (error: any) {
        console.error("Get admin payouts action Error: ", error);
        const e: AxiosError = error as AxiosError;
        return rejectWithValue(e.response?.data || e.message);
      }
    }
);
