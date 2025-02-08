import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { ResponseData } from "../../../interface/Interface";


export const logoutUser = createAsyncThunk<ResponseData, void, {}>(
    'user/logout',
    async (_: void, { rejectWithValue }) => {
  
      try {
        const response = await serverUser.post(userEndPoints.logout, {});
  
        return response.data as ResponseData;
      } catch (error) {
        if (error instanceof AxiosError) {
          return rejectWithValue(error.response?.data);
        }
        return rejectWithValue('An unknown error occurred');
      }
    }
  );