import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialStateError, ResponseData } from "../../interface/Interface";
import { isErrorResponse } from "../../utils/customError";
import { loginAdmin } from "../actions/auth/adminLoginAction";
import { IAdminData } from "../../interface/user/IUserData";

// Admin State interface
export interface IAdminState {
  isAuthenticated: boolean;
  tempMail: string | null;
  error: IInitialStateError | null;
  userData: IAdminData | null;
}

// Initial state
const initialState: IAdminState = {
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
      .addCase(
        loginAdmin.fulfilled,
        (state, action: PayloadAction<ResponseData>) => {
          state.isAuthenticated = true;
          const userData = action.payload.userData as {
            _id: string;
            email: string;
            role: string;
            name?: string;
          };

          if (userData) {
            state.userData = {
              _id: userData._id,
              email: userData.email,
              role: "Admin",
              name: userData.name || "Admin",
            };
          }

          state.error = null;
        }
      )
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isAuthenticated = false;
        if (isErrorResponse(action.payload)) {
          state.error = action.payload.error as IInitialStateError;
        }
      });
  },
});

export const { adminClearError, adminSetError, adminSetIsAuthenticated } =
  adminSlice.actions;
export default adminSlice.reducer;
