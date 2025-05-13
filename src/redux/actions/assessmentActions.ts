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

export interface ISubmitAssessmentResponse {
  score: number;
  totalPoints: number;
  passed: boolean;
  attempts: { score: number; passed: boolean; completedAt: Date; answers: { questionId: string; selectedAnswer: string; isCorrect: boolean }[] }[];
  status: "inProgress" | "failed" | "passed";
}

interface ICourseProgressResponse {
  totalAssessments: number;
  passedAssessments: number;
  progress: number;
}

export const getAllAssessmentsForCourseAction = createAsyncThunk<
  IAssessmentsResponse,
  { courseId: string; page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "student/getAllAssessmentsForCourse",
  async ({ courseId, page, limit }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAllAssessmentsForCourse(courseId, page, limit);
      console.log("getAllAssessmentsForCourseAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getAllAssessmentsForCourseAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("getAllAssessmentsForCourseAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

// Existing actions (unchanged, included for context)
export const createAssessmentAction = createAsyncThunk<
  IAssessment,
  { courseId: string; moduleTitle: string; assessmentData: Partial<IAssessment> },
  { rejectValue: { message: string } }
>(
  "instructor/createAssessment",
  async ({ courseId, moduleTitle, assessmentData }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.createAssessment(courseId, moduleTitle);
      console.log("createAssessmentAction: Posting to URL:", url);
      const response = await serverUser.post(url, assessmentData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("createAssessmentAction: Response:", response.data);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("createAssessmentAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getAssessmentsByCourseAndModuleAction = createAsyncThunk<
  IAssessmentsResponse,
  { courseId: string; moduleTitle: string; page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "instructor/getAssessmentsByCourseAndModule",
  async ({ courseId, moduleTitle, page, limit }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAssessmentsByCourseAndModule(courseId, moduleTitle, page, limit);
      console.log("getAssessmentsByCourseAndModuleAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getAssessmentsByCourseAndModuleAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("getAssessmentsByCourseAndModuleAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const editAssessmentAction = createAsyncThunk<
  IAssessment,
  { assessmentId: string; updateData: Partial<IAssessment> },
  { rejectValue: { message: string } }
>(
  "instructor/editAssessment",
  async ({ assessmentId, updateData }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.editAssessment(assessmentId);
      console.log("editAssessmentAction: Putting to URL:", url);
      const response = await serverUser.put(url, updateData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("editAssessmentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("editAssessmentAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const deleteAssessmentAction = createAsyncThunk<
  void,
  { assessmentId: string },
  { rejectValue: { message: string } }
>(
  "instructor/deleteAssessment",
  async ({ assessmentId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.deleteAssessment(assessmentId);
      console.log("deleteAssessmentAction: Deleting from URL:", url);
      const response = await serverUser.delete(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("deleteAssessmentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return;
    } catch (error) {
      const err = error as AxiosError;
      console.error("deleteAssessmentAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
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
      console.log("getAssessmentsForStudentAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getAssessmentsForStudentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("getAssessmentsForStudentAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
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
      console.log("getAssessmentByIdAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getAssessmentByIdAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("getAssessmentByIdAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const submitAssessmentAction = createAsyncThunk<
  ISubmitAssessmentResponse,
  { assessmentId: string; answers: { questionId: string; selectedAnswer: string }[] },
  { rejectValue: { message: string } }
>(
  "student/submitAssessment",
  async ({ assessmentId, answers }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.submitAssessment(assessmentId);
      console.log("submitAssessmentAction: Posting to URL:", url, { answers });
      const response = await serverUser.post(url, { answers }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("submitAssessmentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      // Transform the response to match ISubmitAssessmentResponse
      return {
        score: response.data.data.score,
        totalPoints: response.data.data.totalPoints,
        passed: response.data.data.passed,
        attempts: [
          {
            score: response.data.data.score,
            passed: response.data.data.passed,
            completedAt: new Date(),
            answers: answers.map((answer) => ({
              ...answer,
              isCorrect: false, // Placeholder, as backend doesn't provide isCorrect
            })),
          },
        ],
        status: response.data.data.status,
      };
    } catch (error) {
      const err = error as AxiosError;
      console.error("submitAssessmentAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
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
      console.log("getAssessmentByIdForStudentAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getAssessmentByIdForStudentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("getAssessmentByIdForStudentAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getAssessmentResultAction = createAsyncThunk<
  ISubmitAssessmentResponse,
  { assessmentId: string },
  { rejectValue: { message: string } }
>(
  "student/getAssessmentResult",
  async ({ assessmentId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getAssessmentResult(assessmentId);
      console.log("getAssessmentResultAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getAssessmentResultAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      const latestAttempt = response.data.data.attempts[response.data.data.attempts.length - 1];
      return {
        score: latestAttempt.score,
        totalPoints: response.data.data.totalPoints,
        passed: latestAttempt.passed,
        attempts: response.data.data.attempts,
        status: response.data.data.status,
      };
    } catch (error) {
      const err = error as AxiosError;
      console.error("getAssessmentResultAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);


export const getCourseProgressAction = createAsyncThunk<
  ICourseProgressResponse,
  { courseId: string },
  { rejectValue: { message: string } }
>(
  "student/getCourseProgress",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getCourseProgress(courseId);
      console.log("getCourseProgressAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getCourseProgressAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("getCourseProgressAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

