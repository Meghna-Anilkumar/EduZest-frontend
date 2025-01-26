import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialState } from "./IState";
import { IInitialStateError } from "../../interface/Interface";
import { isErrorResponse } from "../../utils/customError";
import { loginAdmin} from "../actions/auth/adminLoginAction"

const initialState: IInitialState = {
  isAuthenticated: false,
  tempMail: null,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminClearError(state: IInitialState) {
      state.error = null;
    },
    adminSetError(
      state: IInitialState,
      action: PayloadAction<IInitialStateError>
    ) {
      state.error = action.payload;
    },
    adminSetIsAuthenticated(state: IInitialState) {
      state.isAuthenticated = !state.isAuthenticated;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state: IInitialState) => {
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state: IInitialState, action) => {
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state: IInitialState, action) => {
        if (isErrorResponse(action.payload)) {
          state.isAuthenticated = false;
          state.error = action.payload.error as IInitialStateError;
        }
      });
  },
});

export const { adminClearError, adminSetError, adminSetIsAuthenticated } =
  adminSlice.actions;

export default adminSlice.reducer;
