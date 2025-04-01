import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints"; 
import { serverUser } from "../../services"; 
import { AxiosError } from "axios";
import { ICourse } from "../../interface/ICourse";


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
        withCredentials: true, 
      });
      return response.data.data; 
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const editCourseAction = createAsyncThunk<
  ICourse, // Return type
  { courseId: string; formData: FormData | Partial<ICourse> }, // Argument type
  { rejectValue: { message: string } } // ThunkAPI reject value type
>(
  "course/editCourse",
  async (
    { courseId, formData }: { courseId: string; formData: FormData | Partial<ICourse> },
    { rejectWithValue }
  ) => {
    try {
      const isFormData = formData instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await serverUser.put(
        `${userEndPoints.editCourse.replace(":id", courseId)}`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const createPaymentIntentAction = createAsyncThunk(
  "payment/createPaymentIntent",
  async (
    {
      courseId,
      amount,
      paymentType,
    }: { courseId: string; amount: number; paymentType: "debit" | "credit" },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.post(
        userEndPoints.createPaymentIntent,
        { courseId, amount, paymentType },
        { withCredentials: true } // Include cookies for authentication
      );
      return response.data; // { success, message, data: { clientSecret, paymentId } }
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const confirmPaymentAction = createAsyncThunk(
  "payment/confirmPayment",
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(
        userEndPoints.confirmPayment,
        { paymentId },
        { withCredentials: true } // Include cookies for authentication
      );
      return response.data; // { success, message, data }
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const enrollCourseAction = createAsyncThunk(
  "enrollment/enrollCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(
        userEndPoints.enrollCourse,
        { courseId },
        { withCredentials: true } // Include cookies for authentication
      );
      return response.data; // { success, message, data }
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);