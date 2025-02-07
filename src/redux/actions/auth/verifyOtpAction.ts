import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { VerifyOtpSuccessResponse } from "../../../interface/Interface";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { OtpVerificationData } from "../../../interface/user/IUserData";
import Cookies from "js-cookie";


export const verifyOTP = createAsyncThunk<VerifyOtpSuccessResponse, OtpVerificationData>(
  "user/verifyOTP",
  async (otpData: OtpVerificationData, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.verifyOTP, otpData);
      Cookies.set('accessToken', response.data.token, { expires: 7 });
            Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
      if (!response.data.success) {  
        return rejectWithValue({
          error: {
            message: response.data.message || "OTP verification failed."
          }
        });
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue({
          error: {
            message: error.response?.data?.message || 'An error occurred during verification'
          }
        });
      }
      return rejectWithValue({
        error: {
          message: 'An unknown error occurred'
        }
      });
    }
  }
);
