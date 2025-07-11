import { IInitialState } from "./IState";
import { signUpUser } from "../actions/auth/signupAction";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IInitialStateError } from "../../interface/Interface";
import { verifyOTP } from "../actions/auth/verifyOtpAction";
import { login } from "../actions/auth/userLoginAction";
import { fetchUserData } from "../actions/auth/fetchUserdataAction";
import { IUserdata } from "../../interface/IUserData";
import { logoutUser } from "../actions/auth/logoutUserAction";
import { updateStudentProfileThunk } from "../actions/userActions";
import { googleAuth } from "../actions/auth/googleSigninAction";

const initialState: IInitialState = {
  isAuthenticated: false,
  error: null,
  tempMail: null,
  otpVerified: false,
  userData: null,
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
      if (!action.payload) {
        state.userData = null;
        state.otpVerified = false;
      }
    },

    setTempMail(state, action: PayloadAction<{ email: string } | null>) {
      state.tempMail = action.payload;
    },

    setOtpVerified(state, action: PayloadAction<boolean>) {
      state.otpVerified = action.payload;
    },

    setUserData(state, action: PayloadAction<IUserdata | null>) {
      state.userData = action.payload;
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

      .addCase(signUpUser.rejected, (state, action: PayloadAction<any>) => {
        console.log(action.payload);
        state.isAuthenticated = false;
        state.error = {
          error: "Signup Error",
          message: action.payload?.error?.message || "Something went wrong",
        } as IInitialStateError;
      })

      // verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.otpVerified = true;
          state.tempMail = null;
          // state.userData = action.payload.userData as IUserdata;
          // state.isAuthenticated = !!state.userData;
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
        if (action.payload.success === true) {
          state.userData = action.payload.userData as IUserdata;
          state.isAuthenticated = !!state.userData;
        }
      })

      .addCase(login.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = {
          message:
            (action.payload as { message?: string })?.message || "Login failed",
        };
      })

      //fetch user data
      .addCase(fetchUserData.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.userData = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.userData = null;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to fetch user data";
      })

      // Logout user
      .addCase(logoutUser.pending, (state) => {
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.userData = null;
        state.tempMail = null;
        state.otpVerified = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = {
          message:
            (action.payload as { message?: string })?.message ||
            "Logout failed. Please try again.",
        };
      })

      // Update User Profile
      .addCase(updateStudentProfileThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateStudentProfileThunk.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.userData = {
            ...state.userData,
            ...action.payload.updatedUserData,
          };
        }
      })
      .addCase(updateStudentProfileThunk.rejected, (state, action) => {
        state.error = {
          message:
            typeof action.payload === "string"
              ? action.payload
              : "Failed to update user profile",
        };
      })

      .addCase(googleAuth.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.userData = action.payload.userData as IUserdata;
          state.isAuthenticated = true;
        }
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.error = {
          message:
            (action.payload as { message?: string })?.message ||
            "Google authentication failed",
        };
      });
  },
});

export const {
  userClearError,
  userSetError,
  userSetIsAuthenticated,
  setOtpVerified,
  setUserData,
  setTempMail,
} = userSlice.actions;

export default userSlice.reducer;
