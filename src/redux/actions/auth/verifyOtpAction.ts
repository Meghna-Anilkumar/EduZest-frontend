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
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);
