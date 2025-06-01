import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { serverUser } from "../../services";
import { AxiosError } from "axios";

export const createSubscriptionAction = createAsyncThunk(
  "subscription/createSubscription",
  async (
    {
      userId,
      plan,
      paymentType,
    }: { userId: string; plan: "monthly" | "yearly"; paymentType: "debit" | "credit" },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverUser.post(
        userEndPoints.createSubscription,
        { userId, plan, paymentType },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const confirmSubscriptionAction = createAsyncThunk(
  "subscription/confirmSubscription",
  async (subscriptionId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.post(
        userEndPoints.confirmSubscription,
        { subscriptionId },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);
