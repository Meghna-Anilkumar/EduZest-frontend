import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialState } from "./IState";
import { IInitialStateError, ResponseData } from "../../interface/Interface";
import { isErrorResponse } from "../../utils/customError";
import { loginAdmin } from "../actions/auth/adminLoginAction";
import { IAdminUserData } from "../../interface/user/IUserData";  

// Initial state
const initialState: IInitialState = {
  isAuthenticated: false,
  tempMail: null,
  error: null,
  userData: null,  
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminClearError(state) {
      state.error = null;
    },
    adminSetError(state, action: PayloadAction<IInitialStateError>) {
      state.error = action.payload;
    },
    adminSetIsAuthenticated(state) {
      state.isAuthenticated = !state.isAuthenticated;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<ResponseData>) => {
        state.isAuthenticated = true;

        // ✅ Extract userData correctly
        const userData = action.payload.data as IAdminUserData; 

        if (userData) {
          state.userData = {
            email: userData.email,
            password: userData.password,
            role: userData.role ?? "Admin", // Ensure role is set
            name: userData.name ?? "", 
            isVerified: userData.isVerified ?? false,
            profile: userData.profile ?? {},
            updatedAt: userData.updatedAt ?? new Date(),
            createdAt: userData.createdAt ?? new Date(),
            isBlocked: userData.isBlocked ?? false,
          };
        }

        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isAuthenticated = false;
        if (isErrorResponse(action.payload)) {
          state.error = action.payload.error as IInitialStateError;
        }
      });
  },
});

export const { adminClearError, adminSetError, adminSetIsAuthenticated } = adminSlice.actions;
export default adminSlice.reducer;
