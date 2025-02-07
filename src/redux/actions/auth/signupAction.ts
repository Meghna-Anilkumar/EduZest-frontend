import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from 'axios'
import { UserSignUpData } from "../../../interface/user/IUserData";
import { ResponseData } from "../../../interface/Interface";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import Cookies from "js-cookie";



export const signUpUser = createAsyncThunk<ResponseData, UserSignUpData>(
    "user/signup",
    async (userData: UserSignUpData, { rejectWithValue }) => {
        try {
            const response = await serverUser.post(userEndPoints.signup, userData);
            Cookies.set('accessToken', response.data.token, { expires: 7 });
            Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
            if (!response.data.status) {
                return rejectWithValue({
                    error: {
                        message: response.data.message
                    }
                });
            }
            return response.data;
        } catch (err) {
            const error = err as AxiosError;
            return rejectWithValue({
                error: {
                    message: error.response?.data?.message || "Signup failed"
                }
            });
        }
    }
);
