import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints"; 
import { serverUser } from "../../services"; 
import { AxiosError } from "axios";

interface CourseResponse {
  data: {
    courses: Array<{
      _id: string;
      title: string;
      description: string;
      instructorRef: string;
      categoryRef: string;
      language: string;
      level: string;
      pricing: { type: "free" | "paid"; amount: number };
      thumbnail: string;
      modules: Array<{
        moduleTitle: string;
        lessons: Array<{
          lessonNumber: number;
          title: string;
          description: string;
          objectives: string[];
          video: string;
          duration: string;
        }>;
      }>;
      isRequested: boolean;
      isBlocked: boolean;
      studentsEnrolled: number;
      isPublished: boolean;
      isRejected: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    currentPage: number;
    totalCourses: number;
    totalPages: number;
  };
  message: string;
  success: boolean;
}

export const createCourseAction = createAsyncThunk(
  "instructor/createCourse",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.createCourse, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

