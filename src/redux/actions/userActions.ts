import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { ResponseData } from "../../interface/Interface";

export interface ResetPasswordData{
email:string,
newPassword:string,
confirmNewPassword:string
}


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

export const forgotPasswordThunk=createAsyncThunk(
    "auth/forgotPassword",
    async(email:string,{rejectWithValue})=>{
        try{
            const response=await serverUser.post(userEndPoints.forgotPassword,{email:email})
            return response.data
        }catch (error) {
            return rejectWithValue(error.response?.data || "Failed to send otp");
        }
    }
)


export const resetPasswordThunk = createAsyncThunk<ResponseData, ResetPasswordData>(
    "auth/resetPassword",
    
    async (data, { rejectWithValue }) => {
        try {
            const response = await serverUser.post(userEndPoints.resetPassword, data);
            console.log("Dispatching resetPasswordThunk with:", data);

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to reset password");
        }
    }
);
