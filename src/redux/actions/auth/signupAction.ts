import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from 'axios'
import type { SignUpCredentials} from "../../../interface/user/IUserData";
import { ResponseData } from "../../../interface/Interface";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";




export const signUpUser = createAsyncThunk<ResponseData, SignUpCredentials>(
  "user/signup",
  async (userData:SignUpCredentials, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.signup, userData);
      return await response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data);
      }
      return rejectWithValue('An unknown error occurred');
    }
  }
);
