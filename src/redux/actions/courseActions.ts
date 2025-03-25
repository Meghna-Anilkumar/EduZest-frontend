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

export const getAllCoursesByInstructorAction = createAsyncThunk(
  "instructor/getAllCourses",
  async (
    { page, limit, search }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(userEndPoints.getAllCoursesByInstructor, {
        params: { page, limit, search },
      });
      return response.data.data; 
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getAllActiveCoursesAction = createAsyncThunk(
  "courses/getAllActiveCourses",
  async (
    { page, limit, search }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(userEndPoints.getAllActiveCourses, {
        params: { page, limit, search },
        withCredentials: true, // Include cookies (e.g., userJWT token) for authentication
      });
      return response.data.data; // Return the courses data
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getCourseByIdAction = createAsyncThunk(
  "course/getCourseById",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.get(`${userEndPoints.getCourseById}/${courseId}`, {
        withCredentials: true, // Include cookies (e.g., userJWT token) for authentication
      });
      return response.data.data; // Return the course data
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

