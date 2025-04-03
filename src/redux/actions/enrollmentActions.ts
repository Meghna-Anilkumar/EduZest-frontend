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


export const checkEnrollmentAction = createAsyncThunk(
    "enrollment/checkEnrollment",
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await serverUser.get(`${userEndPoints.checkEnrollment}/${courseId}`, {
                withCredentials: true, // Include cookies for authentication
            });
            return response.data; // { success, message, data: { isEnrolled, enrollment? } }
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