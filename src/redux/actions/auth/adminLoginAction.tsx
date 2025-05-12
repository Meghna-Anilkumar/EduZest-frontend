import { ResponseData } from "../../../interface/Interface";
import { LoginData } from "../../../interface/IUserData";
import { AsyncThunk, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { serverAdmin} from "../../../services";
import { adminEndpoints } from "../../../services/endPoints/endPoints";

export const loginAdmin: AsyncThunk<ResponseData, LoginData, {}> = createAsyncThunk(
    'admin/login',
    async (loginData: LoginData, { rejectWithValue }) => {
      try {
        const response = await serverAdmin.post(adminEndpoints.login, loginData);
        return await response.data
      } catch (error) {
        if (error instanceof AxiosError) {
  
          return rejectWithValue(error.response?.data)
        }
  
        return rejectWithValue('an unknown error')
      }
    }
  );