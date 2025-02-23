import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { ResponseData,IUserdata } from "../../interface/Interface";
import { InstructorApplicationData } from "../../interface/user/IInstructorApply";

export interface ResetPasswordData{
email:string,
newPassword:string,
confirmNewPassword:string
}


export const resendOtpThunk = createAsyncThunk(
    "auth/resendOtp",
    async (email: string, { rejectWithValue }) => {
        try {
            console.log(email,"otp data");
            const response = await serverUser.post(userEndPoints.resendOTP, {email:email});
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Failed to resend OTP");
        }
    }
);

export const forgotPasswordThunk=createAsyncThunk(
    "auth/forgotPassword",
    async(email:string,{rejectWithValue})=>{
        try{
            const response=await serverUser.post(userEndPoints.forgotPassword,{email:email})
            return response.data
        }catch (error) {
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


export const updateUserProfileThunk = createAsyncThunk(
  "auth/updateUserProfile",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Send the FormData to the backend
      const response = await serverUser.put(userEndPoints.updateProfile, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Required for FormData
        },
      });

      console.log("Server Response:", response.data);

      // Extract values from FormData for the return object
      const updatedUserData = {
        name: formData.get("username") as string,
        email: formData.get("email") as string,
        studentDetails: {
          additionalEmail: formData.get("additionalEmail") as string,
        },
        profile: {
          dob: formData.get("dob") as string,
          gender: formData.get("gender") as string,
          profilePic: response.data.data?.profile?.profilePic || "", // Use the Cloudinary URL from the response
        },
      };

      return {
        success: true,
        updatedUserData,
      };
    } catch (error) {
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

