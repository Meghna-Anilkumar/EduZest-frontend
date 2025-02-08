import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { LoginData } from "../../../interface/user/IUserData";
import { ResponseData } from "../../../interface/Interface";


export const login = createAsyncThunk<ResponseData, LoginData>(
    "user/login",
    async (userData: LoginData, { rejectWithValue }) => {
        try {
            const response = await serverUser.post(userEndPoints.login, userData);
            console.log("Login Response:", response.data);

            return response.data;

        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data);
            }
            return rejectWithValue('An unknown error occurred');
        }
    }
);