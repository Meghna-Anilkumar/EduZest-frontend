import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { IUserdata } from "../../../interface/user/IUserData";
import { serverUser } from "../../../services";

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (email: string, { rejectWithValue }) => {
    try {
      if (!email) {
        throw new Error("Email is required.");
      }

      const response = await serverUser.post(userEndPoints.fetchUserdata, { email });

      console.log("Fetched user data:", response.data);
      return response.data as IUserdata;
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch user data");
    }
  }
);
