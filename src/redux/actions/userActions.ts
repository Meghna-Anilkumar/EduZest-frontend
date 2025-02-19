import { createAsyncThunk } from "@reduxjs/toolkit";
import { serverUser } from "../../services";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { ResponseData,IUserdata } from "../../interface/Interface";

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
    async (profile: IUserdata, { rejectWithValue }) => {
      // Structure the data exactly as expected by the backend
      const payload = {
        email: profile.email,
        name: profile.username,
        additionalEmail: profile.additionalEmail,
        profileData: {
          dob: profile.dob,
          gender: profile.gender,
          profilePic: profile.profilePic,
        },
      };
  
      console.log("Final Payload to API:", payload);
  
      try {
        const response = await serverUser.put(userEndPoints.updateProfile, payload);
        console.log("Server Response:", response.data);
        
        // Return updated data in a format that matches the reducer expectations
        return {
          success: true,
          updatedUserData: {
            name: profile.username,
            email: profile.email,
            studentDetails: {
              additionalEmail: profile.additionalEmail
            },
            profile: {
              dob: profile.dob,
              gender: profile.gender,
              profilePic: profile.profilePic
            }
          }
        };
      } catch (error) {
        console.error("Error updating profile:", error.response?.data);
        return rejectWithValue(error.response?.data || "Failed to update profile");
      }
    }
  );