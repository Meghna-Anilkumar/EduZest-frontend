// src/redux/actions/auth/googleAuthAction.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { serverUser } from "../../../services";
import { userEndPoints } from "../../../services/endPoints/endPoints";
import { ResponseData } from "../../../interface/Interface";

export const googleAuth = createAsyncThunk<ResponseData, string>(
    "user/googleAuth",
    async (token: string, { rejectWithValue }) => {
        try {
            const response = await serverUser.post(userEndPoints.googleAuth, { token }, { withCredentials: true });
            console.log("Google Auth Response:", response.data);
            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                return rejectWithValue(error.response?.data);
            }
            return rejectWithValue("An unknown error occurred");
        }
    }
);
