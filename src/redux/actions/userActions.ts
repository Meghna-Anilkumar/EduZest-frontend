import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { userEndPoints } from "../../services/endPoints/endPoints";

export const resendOtpThunk = createAsyncThunk(
    "auth/resendOtp",
    async (email: string, { rejectWithValue }) => {
        try {
            console.log(email,"otp data");
            const response = await serverUser.post(userEndPoints.resendOTP, {email:email});
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to resend OTP");
        }
    }
);
