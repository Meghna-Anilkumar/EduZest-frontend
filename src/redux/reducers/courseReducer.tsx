import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createCourseAction } from "../actions/courseActions";

interface Course {
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
}

interface CourseState {
  loading: boolean;
  data: Course[];
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  error: string | null;
}

const initialState: CourseState = {
  loading: false,
  data: [],
  currentPage: 1,
  totalPages: 1,
  totalCourses: 0,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    storeCourseData: (state, action: PayloadAction<Course>) => {
      state.data.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload as string;
      })
    //   .addCase(getAllCoursesAction.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(getAllCoursesAction.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.data = action.payload.courses;
    //     state.currentPage = action.payload.currentPage;
    //     state.totalPages = action.payload.totalPages;
    //     state.totalCourses = action.payload.totalCourses;
    //   })
    //   .addCase(getAllCoursesAction.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload as string;
    //   });
  },
});

export const { storeCourseData } = courseSlice.actions;
export default courseSlice.reducer;