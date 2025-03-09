import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminEndpoints } from "../../services/endPoints/endPoints";
import { serverAdmin } from "../../services";
import { AxiosError } from "axios";

interface CategoryResponse {
    data: {
        categories: Array<{
            _id: string;
            categoryName: string;
            isActive: boolean;
        }>;
        currentPage: number;
        totalCategories: number;
        totalPages: number;
    };
    message: string;
    success: boolean;
}
export const createCategoryAction = createAsyncThunk(
    "admin/createCategory",
    async (categoryData: { categoryName: string }, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.post(adminEndpoints.createCategory, categoryData);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

export const getAllCategoriesAction = createAsyncThunk(
    "admin/getAllCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.get<CategoryResponse>(adminEndpoints.fetchAllCategories);
            console.log("API Response:", response.data);

            const { categories } = response.data.data;

            if (!Array.isArray(categories)) {
                console.error("Categories is not an array:", categories);
                return rejectWithValue("Invalid data format received from server");
            }

            return {
                categories,
                currentPage: response.data.data.currentPage,
                totalPages: response.data.data.totalPages,
                totalCategories: response.data.data.totalCategories
            };
        } catch (error) {
            const err = error as AxiosError;
            console.error("Fetch categories error:", err);
            return rejectWithValue(err.response?.data || "Failed to fetch categories");
        }
    }

);


export const editCategoryAction = createAsyncThunk(
    "admin/editCategory",
    async (
      { categoryId, categoryName }: { categoryId: string; categoryName: string },
      { rejectWithValue }
    ) => {
      try {
        const url = adminEndpoints.editCategory(categoryId); 
        const response = await serverAdmin.put(url, { categoryName });
        return response.data.data;
      } catch (error) {
        const err = error as AxiosError;
        return rejectWithValue(err.response?.data || { message: err.message });
      }
    }
  );


  interface DeleteCategoryResponse {
    data: {
      _id: string;
      categoryName: string;
      isActive: boolean;
    };
    message: string;
    success: boolean;
  }
  
  export const deleteCategoryAction = createAsyncThunk(
    "admin/deleteCategory",
    async (categoryId: string, { rejectWithValue }) => {
      try {
        const url = adminEndpoints.deleteCategory(categoryId); // Should resolve to "/delete-category/{categoryId}"
        const response = await serverAdmin.put<DeleteCategoryResponse>(url);
        return response.data.data; // Return the updated (soft-deleted) category
      } catch (error) {
        const err = error as AxiosError;
        console.error(`Error deleting category with ID ${categoryId}:`, err);
        return rejectWithValue(err.response?.data || { message: err.message });
      }
    }
  );