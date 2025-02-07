import { IInitialState } from "./IState";
import { signUpUser } from "../actions/auth/signupAction";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialStateError } from "../../interface/Interface";
import { isErrorResponse } from "../../utils/customError";
import { verifyOTP } from "../actions/auth/verifyOtpAction";
import { login } from "../actions/auth/userLoginAction";
import Cookies from "js-cookie";

const initialState: IInitialState = {
  isAuthenticated: !!Cookies.get("accessToken"),
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

    userSetIsAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
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
        if (action.payload.status === false) {
            state.error = {
                error: "Signup Error",
                message: action.payload.message
            };
            return;
        }
        state.tempMail = action.payload.data
            ? (action.payload.data as { email: string })
            : null;
    })

      .addCase(signUpUser.rejected, (state, action: PayloadAction<any>) => {
        console.log(action.payload)
        state.isAuthenticated = false;
        state.error = {
            error: "Signup Error",
            message: action.payload?.error?.message || "Something went wrong"
        } as IInitialStateError;
    })
      

      // verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        if (action.payload.success) {
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

      // user login
      .addCase(login.pending, (state) => {
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("Login Action Fulfilled:", action.payload);

        if (action.payload.success === true) {
          state.isAuthenticated = true;
          console.log("AccessToken and RefreshToken are stored in cookies.");
        } else {
          console.warn("Login failed, setting isAuthenticated to false.");
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
