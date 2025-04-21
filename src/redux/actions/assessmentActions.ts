import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { AxiosError } from "axios";
import { IAssessment } from "../../interface/IAssessment";
import { userEndPoints } from "../../services/endPoints/endPoints";


interface IAssessmentsResponse {
    assessments: IAssessment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

export const createAssessmentAction = createAsyncThunk<
  IAssessment,
  { courseId: string; moduleTitle: string; assessmentData: Partial<IAssessment> },
  { rejectValue: { message: string } }
>(
  "instructor/createAssessment",
  async ({ courseId, moduleTitle, assessmentData }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.createAssessment(courseId, moduleTitle);
      const response = await serverUser.post(url, assessmentData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);


export const getAssessmentsByCourseAndModuleAction = createAsyncThunk<
  IAssessmentsResponse,
  { courseId: string; moduleTitle: string; page: number; limit: number },
  { rejectValue: { message: string } }
>(
  'instructor/getAssessmentsByCourseAndModule',
  async ({ courseId, moduleTitle, page, limit }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAssessmentsByCourseAndModule(courseId, moduleTitle, page, limit);
      const response = await serverUser.get(url, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);