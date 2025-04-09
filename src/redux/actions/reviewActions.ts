import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { serverUser} from "../../services"; 
import { AxiosError } from "axios";

export const addReviewAction = createAsyncThunk(
  "student/addReview",
  async (
    reviewData: { courseId: string; rating: number; comment?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.post(userEndPoints.addReview, reviewData);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);