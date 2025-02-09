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