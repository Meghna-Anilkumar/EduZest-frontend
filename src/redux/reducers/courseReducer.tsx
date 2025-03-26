import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createCourseAction,
  getAllCoursesByInstructorAction,
  getAllActiveCoursesAction,
  editCourseAction,
} from "../actions/courseActions";
import { ICourse} from "../../interface/ICourse"; 

interface CourseState {
  loading: boolean;
  data: ICourse[]; 
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  activeCourses: {
    courses: ICourse[];
    currentPage: number;
    totalPages: number;
    totalCourses: number;
  };
  error: string | null;
}

const initialState: CourseState = {
  loading: false,
  data: [], 
  currentPage: 1,
  totalPages: 1,
  totalCourses: 0,
  activeCourses: {
    courses: [], 
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
    storeCourseData: (state, action: PayloadAction<ICourse>) => {
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
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalCourses = action.payload.totalCourses;
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
      })
      // Edit Course
      .addCase(editCourseAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCourseAction.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the course in the data array
        const index = state.data.findIndex(course => course._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        
        // Also update the course in activeCourses if it exists
        const activeIndex = state.activeCourses.courses.findIndex(course => course._id === action.payload._id);
        if (activeIndex !== -1) {
          state.activeCourses.courses[activeIndex] = action.payload;
        }
      })
      .addCase(editCourseAction.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message: string })?.message || "Failed to edit course";
      });
  },
});

export const { storeCourseData, clearError } = courseSlice.actions;
export default courseSlice.reducer;