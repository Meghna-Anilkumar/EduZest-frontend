import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { serverUser } from "../../services";
import { AxiosError } from "axios";


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
                { withCredentials: true }
            );
            return response.data;
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
                { withCredentials: true }
            );
            return response.data;
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
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);


export const checkEnrollmentAction = createAsyncThunk(
    "enrollment/checkEnrollment",
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await serverUser.get(`${userEndPoints.checkEnrollment}/${courseId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);


export const getAllEnrollmentsAction = createAsyncThunk(
    "enrollment/getAllEnrollments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await serverUser.get(userEndPoints.enrollments, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getPaymentsByUserAction = createAsyncThunk(
    "payment/getPaymentsByUser",
    async (
        {
            userId,
            page,
            limit = 10,
            search = "",
            sortField = "createdAt",
            sortOrder = "desc",
        }: {
            userId: string;
            page: number;
            limit?: number;
            search?: string;
            sortField?: string;
            sortOrder?: "asc" | "desc";
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await serverUser.get(userEndPoints.getPaymentHistory, {
                params: { userId, page, limit, search, sortField, sortOrder },
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);


export const getLessonProgressAction = createAsyncThunk(
    "enrollment/getLessonProgress",
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await serverUser.get(`/student/lesson-progress/${courseId}`, {
                withCredentials: true,
            });
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const updateLessonProgressAction = createAsyncThunk(
    "enrollment/updateLessonProgress",
    async (
        {
            courseId,
            lessonId,
            progress,
        }: { courseId: string; lessonId: string; progress: number },
        { rejectWithValue }
    ) => {
        try {
            const response = await serverUser.post(
                "/student/update-lesson-progress",
                { courseId, lessonId, progress },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);


export const getInstructorCourseStatsAction = createAsyncThunk(
    "enrollment/getInstructorCourseStats",
    async (_, { rejectWithValue }) => {
      try {
        const response = await serverUser.get(userEndPoints.getCourseStats, {
          withCredentials: true,
        });
        return response.data;
      } catch (error) {
        const err = error as AxiosError;
        return rejectWithValue(err.response?.data || { message: err.message });
      }
    }
  );