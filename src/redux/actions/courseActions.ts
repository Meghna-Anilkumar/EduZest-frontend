import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints"; 
import { serverUser } from "../../services"; 
import { AxiosError } from "axios";


export const createCourseAction = createAsyncThunk(
  "instructor/createCourse",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.createCourse, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getAllCoursesAction = createAsyncThunk(
  "instructor/getAllCourses",
  async (
    { page, limit, search }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(userEndPoints.getAllCourses, {
        params: { page, limit, search },
      });
      return response.data.data; 
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

