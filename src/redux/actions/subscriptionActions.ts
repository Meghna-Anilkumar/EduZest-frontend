import { createAsyncThunk } from "@reduxjs/toolkit";
import { userEndPoints } from "../../services/endPoints/endPoints";
import { serverUser } from "../../services";
import { AxiosError } from "axios";

// Define the response type for better TypeScript support
interface SubscriptionResponse {
  success: boolean;
  message: string;
  data?: {
    clientSecret?: string;
    subscriptionId?: string;
    stripeSubscriptionId?: string;
    hasActiveSubscription?: boolean;
    plan?: "monthly" | "yearly";
  };
}

export const createSubscriptionAction = createAsyncThunk<
  SubscriptionResponse,
  { userId: string; plan: "monthly" | "yearly"; paymentType: "debit" | "credit" }
>(
  "subscription/createSubscription",
  async ({ userId, plan, paymentType }, { rejectWithValue }) => {
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

export const confirmSubscriptionAction = createAsyncThunk<
  SubscriptionResponse,
  string
>(
  "subscription/confirmSubscription",
  async (subscriptionId, { rejectWithValue }) => {
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

export const getSubscriptionStatus = createAsyncThunk<
  SubscriptionResponse,
  string
>(
  "subscription/getStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await serverUser.get(userEndPoints.getSubscriptionStatus, {
        params: { userId },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);