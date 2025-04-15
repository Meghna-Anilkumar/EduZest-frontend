import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints"; 
import { serverUser } from "../../services"; 
import { AxiosError } from "axios";
import { ICourse ,FilterOptions,SortOptions} from "../../interface/ICourse";


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

export const getAllCoursesByInstructorAction = createAsyncThunk(
  "instructor/getAllCourses",
  async (
    { page, limit, search }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(userEndPoints.getAllCoursesByInstructor, {
        params: { page, limit, search },
      });
      return response.data.data; 
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getAllActiveCoursesAction = createAsyncThunk(
  "courses/getAllActiveCourses",
  async (
    {
      page,
      limit,
      search,
      filters,
      sort,
    }: {
      page: number;
      limit: number;
      search?: string;
      filters?: FilterOptions;
      sort?: SortOptions;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(userEndPoints.getAllActiveCourses, {
        params: {
          page,
          limit,
          search,
          ...filters,
          sortField: sort?.field,
          sortOrder: sort?.order,
        },
        withCredentials: true,
      });
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const getCourseByIdAction = createAsyncThunk(
  "course/getCourseById",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.get(`${userEndPoints.getCourseById}/${courseId}`, {
        withCredentials: true, 
      });
      console.log("API Response:", response.data);
      return response.data.data; 
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const streamVideoAction = createAsyncThunk(
  'course/streamVideo',
  async (
    { courseId, videoKey }: { courseId: string; videoKey: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.get(
        `${userEndPoints.streamVideo.replace(':courseId', courseId)}`,
        {
          params: { videoKey },
          responseType: 'blob',
          withCredentials: true,
        }
      );
      const blob = new Blob([response.data], { type: 'video/mp4' });
      console.log('Stream Video Response:', {
        videoKey,
        blobSize: blob.size,
        blobType: blob.type,
      });
      const videoUrl = window.URL.createObjectURL(blob);
      console.log('Generated Blob URL:', { videoUrl, videoKey });
      return { videoUrl, videoKey };
    } catch (error) {
      const err = error as AxiosError;
      console.error('Failed to stream video:', {
        videoKey,
        message: err.message,
        status: err.response?.status,
      });
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const editCourseAction = createAsyncThunk<
  ICourse, // Return type
  { courseId: string; formData: FormData | Partial<ICourse> }, // Argument type
  { rejectValue: { message: string } } // ThunkAPI reject value type
>(
  "course/editCourse",
  async (
    { courseId, formData }: { courseId: string; formData: FormData | Partial<ICourse> },
    { rejectWithValue }
  ) => {
    try {
      const isFormData = formData instanceof FormData;
      const headers = isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" };

      const response = await serverUser.put(
        `${userEndPoints.editCourse.replace(":id", courseId)}`,
        formData,
        {
          headers,
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);


export const getCourseByInstructorAction = createAsyncThunk<
  ICourse, // Return type
  string, // Argument type (courseId)
  { rejectValue: { message: string } } // ThunkAPI reject value type
>(
  "instructor/getCourseByInstructor",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.get(
        `${userEndPoints.getCourseByInstructor}/${courseId}`,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);


