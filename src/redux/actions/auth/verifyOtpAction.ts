import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { VerifyOtpSuccessResponse } from "../../../interface/Interface";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { OtpVerificationData } from "../../../interface/user/IUserData";



export const verifyOTP = createAsyncThunk<VerifyOtpSuccessResponse, OtpVerificationData>(
  "user/verifyOTP",
  async (otpData: OtpVerificationData, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.verifyOTP, otpData);
      if (response.data.status === 'error') {
        return rejectWithValue({
          error: {
            message: response.data.message
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
