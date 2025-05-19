import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { ResponseData } from "../../interface/Interface";
import { AppDispatch } from "../store";
import { userSetIsAuthenticated, setUserData } from "../reducers/userReducer";

export interface ResetPasswordData {
  email: string,
  newPassword: string,
  confirmNewPassword: string
}


export const resendOtpThunk = createAsyncThunk(
  "auth/resendOtp",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log(email, "otp data");
      const response = await serverUser.post(userEndPoints.resendOTP, { email: email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to resend OTP");
    }
  }
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.forgotPassword, { email: email })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to send otp");
    }
  }
)


export const resetPasswordThunk = createAsyncThunk<ResponseData, ResetPasswordData>(
  "auth/resetPassword",

  async (data, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(userEndPoints.resetPassword, data);
      console.log("Dispatching resetPasswordThunk with:", data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to reset password");
    }
  }
);


export const updateStudentProfileThunk = createAsyncThunk(
  "auth/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await serverUser.put(userEndPoints.updateStudentProfile, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server Response:", response.data);

      const updatedUserData = {
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
    } catch (error: any) {
      console.error("Error updating profile:", error.response?.data);
      return rejectWithValue(error.response?.data || "Failed to update profile");
    }
  }
);


export const switchToInstructorThunk = createAsyncThunk<
  ResponseData,
  string, // Expect userId as a string
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
    } catch (error: any) {
      console.error("Error switching to instructor:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to switch to instructor role"
      );
    }
  }
);


export const updateInstructorProfileThunk = createAsyncThunk(
  "auth/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await serverUser.put(userEndPoints.updateInstructorProfile, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Server Response:", response.data);

      const updatedUserData = {
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
    } catch (error: any) {
      console.error("Error updating profile:", error.response?.data);
      return rejectWithValue(error.response?.data || "Failed to update profile");
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
      return rejectWithValue(error.response?.data || "Failed to change password");
    }
  }
);


//apply instructor
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
      console.error("Instructor Application Error:", error.response?.data);
      return rejectWithValue(error.response?.data || "Failed to apply for instructor position");
    }
  }
);


interface RefreshSignedUrlResponse extends ResponseData {
  signedUrl: string;
}

// Thunk to refresh a signed URL
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
    } catch (error: any) {
      console.error("Error refreshing signed URL:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "Failed to refresh signed URL");
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
    } catch (error: any) {
      console.error("Get instructor payouts action Error:", error.response?.data);
      return rejectWithValue(error.response?.data || "Failed to fetch instructor payouts");
    }
  }
);