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

  interface ISubmitAssessmentResponse {
    score: number;
    totalQuestions: number;
    passed: boolean;
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


export const editAssessmentAction = createAsyncThunk<
  IAssessment,
  { assessmentId: string; updateData: Partial<IAssessment> },
  { rejectValue: { message: string } }
>(
  'instructor/editAssessment',
  async ({ assessmentId, updateData }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.editAssessment(assessmentId);
      const response = await serverUser.put(url, updateData, {
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


export const deleteAssessmentAction = createAsyncThunk<
  void,
  { assessmentId: string },
  { rejectValue: { message: string } }
>(
  'instructor/deleteAssessment',
  async ({ assessmentId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.deleteAssessment(assessmentId);
      const response = await serverUser.delete(url, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }

      return;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);


export const getAssessmentsForStudentAction = createAsyncThunk<
  IAssessmentsResponse,
  { courseId: string; moduleTitle: string; page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "student/getAssessmentsForStudent",
  async ({ courseId, moduleTitle, page, limit }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAssessmentsForStudent(courseId, moduleTitle, page, limit);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
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


export const getAssessmentByIdAction = createAsyncThunk<
  IAssessment,
  { assessmentId: string },
  { rejectValue: { message: string } }
>(
  "student/getAssessmentById",
  async ({ assessmentId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAssessmentById(assessmentId);
      console.log("Fetching assessment from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
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

export const submitAssessmentAction = createAsyncThunk<
  ISubmitAssessmentResponse,
  { assessmentId: string; answers: { questionId: string; selectedOption: number }[] },
  { rejectValue: { message: string } }
>(
  "student/submitAssessment",
  async ({ assessmentId, answers }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.submitAssessment(assessmentId);
      console.log("Submitting assessment to URL:", url);
      const response = await serverUser.post(url, { answers }, {
        headers: { "Content-Type": "application/json" },
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

export const getAssessmentByIdForStudentAction = createAsyncThunk<
  IAssessment,
  { assessmentId: string },
  { rejectValue: { message: string } }
>(
  "student/getAssessmentByIdForStudent",
  async ({ assessmentId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAssessmentByIdForStudent(assessmentId);
      console.log("Fetching student assessment from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
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