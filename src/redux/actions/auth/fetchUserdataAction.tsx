import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { IUserdataResponse } from "../../../interface/IUserData";
import { serverUser } from "../../../services";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching user data...");

      const response = await serverUser.get(userEndPoints.fetchUserdata, {
        withCredentials: true, 
      });

      console.log("Fetch user data response:", response.data);
      return response.data as IUserdataResponse; 
    } catch (error: any) {
      console.error("fetchUserData error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || "Failed to fetch user data");
    }
  }
);