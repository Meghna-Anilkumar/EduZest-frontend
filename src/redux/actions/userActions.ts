import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { ResponseData } from "../../interface/Interface";
import { AppDispatch } from "../store";
import { userSetIsAuthenticated, setUserData } from "../reducers/userReducer";
import { AxiosError } from "axios";

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ErrorResponse {
  message?: string;
  [key: string]: unknown;
}

export const resendOtpThunk = createAsyncThunk(
  "auth/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log(email, "otp data");
      const response = await serverUser.post(userEndPoints.resendOTP, { email: email });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || "Failed to resend OTP");
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.forgotPassword, { email: email });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || "Failed to send otp");
    }
  }
);

export const resetPasswordThunk = createAsyncThunk<ResponseData, ResetPasswordData>(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.resetPassword, data);
      console.log("Dispatching resetPasswordThunk with:", data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || "Failed to reset password");
    }
  }
);

interface UpdatedUserData {
  name: string;
  email: string;
  studentDetails: {
    additionalEmail: string;
  };
  profile: {
    dob: string;
    gender: string;
    profilePic: string;
  };
}

interface UpdateProfileResponse {
  success: boolean;
  updatedUserData: UpdatedUserData;
}

interface ProfileUpdateServerResponse {
  data?: {
    profile?: {
      profilePic?: string;
    };
  };
}

export const updateStudentProfileThunk = createAsyncThunk<
  UpdateProfileResponse,
  FormData,
  { rejectValue: ErrorResponse }
>(
  "auth/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await serverUser.put<ProfileUpdateServerResponse>(
        userEndPoints.updateStudentProfile,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Server Response:", response.data);

      const updatedUserData: UpdatedUserData = {
        name: formData.get("username") as string,
        email: formData.get("email") as string,
        studentDetails: {
          additionalEmail: formData.get("additionalEmail") as string,
        },
        profile: {
          dob: formData.get("dob") as string,
          gender: formData.get("gender") as string,
          profilePic: response.data.data?.profile?.profilePic || "",
        },
      };

      return {
        success: true,
        updatedUserData,
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error updating profile:", axiosError.response?.data);
      return rejectWithValue(axiosError.response?.data || { message: "Failed to update profile" });
    }
  }
);

export const switchToInstructorThunk = createAsyncThunk<
  ResponseData,
  string,
  { dispatch: AppDispatch; rejectValue: string | ResponseData }
>(
  "auth/switchToInstructor",
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      console.log("Switching to Instructor for userId:", userId);
      const response = await serverUser.post(userEndPoints.switchToInstructor, { userId });

      console.log("Switch to instructor response:", response.data);

      const result = response.data as ResponseData;

      if (result.success && result.redirectURL === "/login") {
        dispatch(userSetIsAuthenticated(false));
        dispatch(setUserData(null));
        localStorage.clear();
      }

      return result;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error switching to instructor:", axiosError.response?.data);
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to switch to instructor role"
      );
    }
  }
);

interface InstructorUpdateData {
  name: string;
  email: string;
  qualification: string;
  studentDetails: {
    additionalEmail: string;
  };
  profile: {
    dob: string;
    gender: string;
    profilePic: string;
  };
}

interface InstructorUpdateResponse {
  success: boolean;
  updatedUserData: InstructorUpdateData;
}

export const updateInstructorProfileThunk = createAsyncThunk<
  InstructorUpdateResponse,
  FormData,
  { rejectValue: ErrorResponse }
>(
  "auth/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await serverUser.put<ProfileUpdateServerResponse>(
        userEndPoints.updateInstructorProfile,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Server Response:", response.data);

      const updatedUserData: InstructorUpdateData = {
        name: formData.get("username") as string,
        email: formData.get("email") as string,
        qualification: formData.get("qualification") as string,
        studentDetails: {
          additionalEmail: formData.get("additionalEmail") as string,
        },
        profile: {
          dob: formData.get("dob") as string,
          gender: formData.get("gender") as string,
          profilePic: response.data.data?.profile?.profilePic || "",
        },
      };

      return {
        success: true,
        updatedUserData,
      };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error updating profile:", axiosError.response?.data);
      return rejectWithValue(axiosError.response?.data || { message: "Failed to update profile" });
    }
  }
);

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const changePasswordThunk = createAsyncThunk(
  "auth/changePassword",
  async (passwordData: ChangePasswordData, { rejectWithValue }) => {
    try {
      const response = await serverUser.put(userEndPoints.changePassword, passwordData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      return rejectWithValue(axiosError.response?.data || "Failed to change password");
    }
  }
);

export const applyForInstructorThunk = createAsyncThunk(
  "instructor/apply",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      console.log("Applying for Instructor with FormData:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await serverUser.post(userEndPoints.applyInstructor, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Server Response:", response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Instructor Application Error:", axiosError.response?.data);
      return rejectWithValue(
        axiosError.response?.data || "Failed to apply for instructor position"
      );
    }
  }
);

interface RefreshSignedUrlResponse extends ResponseData {
  signedUrl: string;
}

export const refreshSignedUrlThunk = createAsyncThunk<
  RefreshSignedUrlResponse,
  { key: string },
  { rejectValue: string }
>(
  "auth/refreshSignedUrl",
  async ({ key }, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.refreshSignedUrl, { key });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error refreshing signed URL:", axiosError.response?.data);
      return rejectWithValue(
        axiosError.response?.data?.message || "Failed to refresh signed URL"
      );
    }
  }
);

export const getInstructorPayoutsAction = createAsyncThunk(
  "instructor/getInstructorPayouts",
  async (
    {
      instructorId,
      page,
      limit,
      search,
      sortField,
      sortOrder,
      courseFilter,
    }: {
      instructorId: string;
      page: number;
      limit: number;
      search?: string;
      sortField?: string;
      sortOrder?: "asc" | "desc";
      courseFilter?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      if (!instructorId) {
        throw new Error("Instructor ID is required");
      }
      const url = userEndPoints.getInstructorPayouts(
        page,
        limit,
        search,
        sortField,
        sortOrder,
        courseFilter
      );
      console.log("Fetching instructor payouts with URL:", url);
      const response = await serverUser.get(url);
      console.log("Action response:", response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Get instructor payouts action Error:", axiosError.response?.data);
      return rejectWithValue(
        axiosError.response?.data || "Failed to fetch instructor payouts"
      );
    }
  }
);