import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "@/services";
import { AxiosError } from "axios";
import { IExam } from "../../components/instructor/courses/ExamsPage"
import { userEndPoints } from "../../services/endPoints/endPoints";

interface IExamsResponse {
  exams: IExam[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IExamResultResponse {
  score: number;
  totalPoints: number;
  passed: boolean;
  attempts: {
    id: string;
    score: number;
    passed: boolean;
    completedAt: Date;
    answers: { questionId: string; selectedAnswerIndex: number; isCorrect: boolean }[];
  }[];
  status: "inProgress" | "failed" | "passed";
}

export const createExamAction = createAsyncThunk<
  IExam,
  { courseId: string; examData: Partial<IExam> },
  { rejectValue: { message: string } }
>(
  "instructor/createExam",
  async ({ courseId, examData }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.createExam(courseId);
      console.log("createExamAction: Posting to URL:", url);
      const response = await serverUser.post(url, examData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("createExamAction: Response:", response.data);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("createExamAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getExamsByCourseAction = createAsyncThunk<
  IExamsResponse,
  { courseId: string; page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "instructor/getExamsByCourse",
  async ({ courseId, page, limit }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getExamsByCourse(courseId, page, limit);
      console.log("getExamsByCourseAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getExamsByCourseAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "getExamsByCourseAction: Error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const editExamAction = createAsyncThunk<
  IExam,
  { examId: string; updateData: Partial<IExam> },
  { rejectValue: { message: string } }
>(
  "instructor/editExam",
  async ({ examId, updateData }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.editExam(examId);
      console.log("editExamAction: Putting to URL:", url);
      const response = await serverUser.put(url, updateData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("editExamAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error("editExamAction: Error:", err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const deleteExamAction = createAsyncThunk<
  void,
  { examId: string },
  { rejectValue: { message: string } }
>(
  "instructor/deleteExam",
  async ({ examId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.deleteExam(examId);
      console.log("deleteExamAction: Deleting from URL:", url);
      const response = await serverUser.delete(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("deleteExamAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "deleteExamAction: Error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getExamsForStudentAction = createAsyncThunk<
  IExamsResponse,
  { courseId: string; page: number; limit: number },
  { rejectValue: { message: string } }
>(
  "student/getExamsForStudent",
  async ({ courseId, page, limit }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getExamsForStudent(courseId, page, limit);
      console.log("getExamsForStudentAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getExamsForStudentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "getExamsForStudentAction: Error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getExamByIdAction = createAsyncThunk<
  IExam,
  { examId: string },
  { rejectValue: { message: string } }
>(
  "student/getExamById",
  async ({ examId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getExamById(examId);
      console.log("getExamByIdAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getExamByIdAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "getExamByIdAction: Error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const submitExamAction = createAsyncThunk<
  IExamResultResponse,
  {
    examId: string;
    answers: { questionId: string; selectedAnswerIndex: number }[];
  },
  { rejectValue: { message: string } }
>(
  "student/submitExam",
  async ({ examId, answers }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.submitExam(examId);
      console.log("submitExamAction: Posting to URL:", url, { answers });
      const response = await serverUser.post(url, { answers }, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("submitExamAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "submitExamAction: Error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getExamByIdForStudentAction = createAsyncThunk<
  IExam,
  { examId: string },
  { rejectValue: { message: string } }
>(
  "student/getExamByIdForStudent",
  async ({ examId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getExamByIdForStudent(examId);
      console.log("getExamByIdForStudentAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getExamByIdForStudentAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "getExamByIdForStudentAction: Error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);

export const getExamResultAction = createAsyncThunk<
  IExamResultResponse,
  { examId: string },
  { rejectValue: { message: string } }
>(
  "student/getExamResult",
  async ({ examId }, { rejectWithValue }) => {
    try {
      const url = userEndPoints.getExamResult(examId);
      console.log("getExamResultAction: Fetching from URL:", url);
      const response = await serverUser.get(url, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      console.log("getExamResultAction: Response:", response.data);
      if (!response.data.success) {
        return rejectWithValue({ message: response.data.message });
      }
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      console.error(
        "getExamResultAction: Error:",
        err.response?.data || err.message
      );
      return rejectWithValue(
        err.response?.data as { message: string } || { message: err.message }
      );
    }
  }
);