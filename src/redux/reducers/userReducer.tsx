import { IInitialState } from "./IState";
import { signUpUser } from "../actions/auth/signupAction";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialStateError, ResponseStatus } from "../../interface/Interface";
import { isErrorResponse } from "../../utils/customError";
import { verifyOTP } from "../actions/auth/verifyOtpAction";
import { login } from "../actions/auth/userLoginAction";

const initialState: IInitialState = {
  isAuthenticated: false,
  error: null,
  tempMail: null,
  otpVerified: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userClearError(state) {
      state.error = null;
    },

    userSetError(state, action: PayloadAction<IInitialStateError>) {
      state.error = action.payload;
    },

    userSetIsAuthenticated(state) {
      state.isAuthenticated = !state.isAuthenticated;
    },

    setOtpVerified(state, action: PayloadAction<boolean>) {
      state.otpVerified = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      //signup
      .addCase(signUpUser.pending, (state) => {
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.tempMail = action.payload.data
          ? (action.payload.data as { email: string })
          : null;
      })

      .addCase(signUpUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        if (isErrorResponse(action.payload)) {
          state.error = action.payload.error as IInitialStateError | null;
        }
      })

      //verify otp
      .addCase(verifyOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        if (action.payload.status === "success") {
          state.otpVerified = true;
        } else {
          state.otpVerified = false;
        }
      })
      .addCase(verifyOTP.rejected, (state, action: PayloadAction<any>) => {
        state.otpVerified = false;
        if (
          action.payload &&
          typeof action.payload === "object" &&
          "error" in action.payload
        ) {
          state.error = {
            message: action.payload.error.message,
          };
        } else {
          state.error = {
            message: "An error occurred during verification",
          };
        }
      })

      //user login
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        if (action.payload.status === ResponseStatus.SUCCESS) {
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        if (
          action.payload &&
          typeof action.payload === "object" &&
          "message" in action.payload
        ) {
          state.error = {
            message: (action.payload as { message: string }).message,
          };
        } else {
          state.error = {
            message: "An error occurred during login",
          };
        }
      });
  },
});

export const {
  userClearError,
  userSetError,
  userSetIsAuthenticated,
  setOtpVerified,
} = userSlice.actions;

export default userSlice.reducer;
