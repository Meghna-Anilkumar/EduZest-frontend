import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { IUserdata } from "../../../interface/user/IUserData";
import Cookies from "js-cookie";
import { serverUser } from "../../../services";


export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("accessToken");

      if (!token) throw new Error("No access token found");

      const response = await serverUser.get(userEndPoints.fetchUserdata, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data as IUserdata;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch user data");
    }
  }
);
