import { createAsyncThunk } from "@reduxjs/toolkit";
// import { ResponseData } from "../../interface/Interface";
import { adminEndpoints } from "../../services/endPoints/endPoints";
import { serverAdmin } from "../../services";
import { AxiosError } from "axios";


//fetch all students
export const getAllStudentsAction = createAsyncThunk(
    "admin/getAllStudents",
    async ({ page, limit }: { page: number, limit: number }, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.get(adminEndpoints.getAllStudents(page, limit))
            return response.data
        } catch (error: any) {
            console.log("Get students action Error: ", error);
            const e: AxiosError = error as AxiosError;
            return rejectWithValue(e.response?.data || e.message);
        }
    }
)

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
            return response.data;
        } catch (error: any) {
            console.error("Get requested users action Error: ", error);
            const e: AxiosError = error as AxiosError;
            return rejectWithValue(e.response?.data || e.message);
        }
    }
);
