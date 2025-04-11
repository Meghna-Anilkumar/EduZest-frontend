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

export const getReviewsByCourseAction = createAsyncThunk(
  "student/getReviewsByCourse",
  async (
    { courseId, skip = 0, limit = 10 }: { courseId: string; skip?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(`${userEndPoints.getReviewsByCourse.replace(':courseId', courseId)}`, {
        params: { skip, limit }, 
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);


export const getReviewByUserAndCourseAction = createAsyncThunk(
  "student/getReviewByUserAndCourse",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.get(
        `${userEndPoints.getReview.replace(":courseId", courseId)}`
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);