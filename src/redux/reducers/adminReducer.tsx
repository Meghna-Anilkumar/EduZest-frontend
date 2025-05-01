import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialStateError, ResponseData } from "../../interface/Interface";
import { isErrorResponse } from "../../utils/customError";
import { loginAdmin } from "../actions/auth/adminLoginAction";
import { adminLogout } from "../actions/auth/adminLogoutAction"; 
import { IAdminData } from "../../interface/IUserData";

export interface IAdminState {
  isAuthenticated: boolean;
  tempMail: string | null;
  error: IInitialStateError | null;
  userData: IAdminData | null;
}

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
      })
      .addCase(adminLogout.pending, (state) => {
        state.error = null;
      })
      .addCase(adminLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.userData = null;
        state.error = null;
      })
      .addCase(adminLogout.rejected, (state, action) => {
        if (isErrorResponse(action.payload)) {
          state.error = action.payload.error as IInitialStateError;
        }
      });
  },
});

export const { adminClearError, adminSetError, adminSetIsAuthenticated } =
  adminSlice.actions;
export default adminSlice.reducer;
