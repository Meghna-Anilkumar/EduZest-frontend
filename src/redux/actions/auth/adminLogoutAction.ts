import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { serverAdmin } from "../../../services";
import { adminEndpoints } from "../../../services/endPoints/endPoints";

export const adminLogout = createAsyncThunk(
  "admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await serverAdmin.post(adminEndpoints.logout);
      console.log(response)
      return await response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);
