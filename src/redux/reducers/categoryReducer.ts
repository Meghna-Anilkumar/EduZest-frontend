import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getAllCategoriesAction } from "../actions/categoryActions";

interface Category {
  _id: string;
  categoryName: string;
  isActive: boolean;
}

interface CategoryState {
  loading: boolean;
  data: Category[]; // This is the correct property name
  currentPage: number;
  totalPages: number;
  totalCategories: number;
  error: string | null;
}

const initialState: CategoryState = {
  loading: false,
  data: [],
  currentPage: 1,
  totalPages: 1,
  totalCategories: 0,
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    storeCategoryData: (state, action: PayloadAction<Category>) => {
      state.data.push(action.payload); // Correct: using state.data
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllCategoriesAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategoriesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.categories; // Correct: assigning to state.data
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalCategories = action.payload.totalCategories;
      })
      .addCase(getAllCategoriesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { storeCategoryData } = categorySlice.actions;
export default categorySlice.reducer;