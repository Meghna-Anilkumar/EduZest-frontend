// slices/courseSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createCourseAction,
  getAllCoursesByInstructorAction,
  getAllActiveCoursesAction,
} from "../actions/courseActions";

// Define the Course interface based on your ICourse schema
interface Course {
  _id: string;
  title: string;
  description: string;
  instructorRef: { _id: string; name: string; profile: { profilePic: string } };
  categoryRef: { _id: string; categoryName: string };
  language: string;
  level: "beginner" | "intermediate" | "advanced";
  pricing: { type: "free" | "paid"; amount: number };
  thumbnail: string;
  modules: Array<{
    moduleTitle: string;
    lessons: Array<{
      lessonNumber: string;
      title: string;
      description: string;
      objectives?: string[];
      video: string;
      duration?: string;
    }>;
  }>;
  trial: { video?: string };
  attachments?: { title?: string; url?: string };
  isRequested: boolean;
  isBlocked: boolean;
  studentsEnrolled: number;
  isPublished: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CourseState {
  loading: boolean;
  data: Course[]; // For instructor's courses (getAllCoursesByInstructor)
  currentPage: number; // For instructor's courses pagination
  totalPages: number; // For instructor's courses pagination
  totalCourses: number; // For instructor's courses pagination
  activeCourses: {
    courses: Course[]; // For active courses (getAllActiveCourses)
    currentPage: number;
    totalPages: number;
    totalCourses: number;
  };
  error: string | null;
}

const initialState: CourseState = {
  loading: false,
  data: [], // For instructor's courses
  currentPage: 1, // For instructor's courses
  totalPages: 1, // For instructor's courses
  totalCourses: 0, // For instructor's courses
  activeCourses: {
    courses: [], // For active courses
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
  },
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    storeCourseData: (state, action: PayloadAction<Course>) => {
      state.data.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Course
      .addCase(createCourseAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourseAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createCourseAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message: string })?.message || "Failed to create course";
      })
      // Get All Courses By Instructor
      .addCase(getAllCoursesByInstructorAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoursesByInstructorAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.courses;
        state.currentPage = action.payload.currentPage; // Update top-level pagination
        state.totalPages = action.payload.totalPages; // Update top-level pagination
        state.totalCourses = action.payload.totalCourses; // Update top-level pagination
      })
      .addCase(getAllCoursesByInstructorAction.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch courses";
      })
      // Get All Active Courses
      .addCase(getAllActiveCoursesAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllActiveCoursesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.activeCourses.courses = action.payload.courses;
        state.activeCourses.currentPage = action.payload.currentPage;
        state.activeCourses.totalPages = action.payload.totalPages;
        state.activeCourses.totalCourses = action.payload.totalCourses;
      })
      .addCase(getAllActiveCoursesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message: string })?.message || "Failed to fetch active courses";
      });
  },
});

export const { storeCourseData, clearError } = courseSlice.actions;
export default courseSlice.reducer;