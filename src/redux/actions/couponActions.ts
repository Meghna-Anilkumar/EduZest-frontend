import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminEndpoints, userEndPoints } from "../../services/endPoints/endPoints";
import { serverAdmin, serverUser } from "../../services";
import { AxiosError } from "axios";
import { Coupon } from "@/components/admin/Coupons";

interface CouponResponse {
  data: {
    coupons: Coupon[];
    total: number;
    page?: number;
    totalPages?: number;
  };
  message: string;
  success: boolean;
}

interface CreateCouponData {
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  expirationDate: string;
  isActive: boolean;
}

interface UpdateCouponData {
  couponId: string;
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  expirationDate: string;
  isActive: boolean;
}

interface DeleteCouponResponse {
  data: Coupon | null;
  message: string;
  success: boolean;
}

interface CheckCouponUsageResponse {
  success: boolean;
  message: string;
}

// Create Coupon Action
export const createCouponAction = createAsyncThunk(
  "admin/createCoupon",
  async (couponData: CreateCouponData, { rejectWithValue }) => {
    try {
      const response = await serverAdmin.post(adminEndpoints.createCoupon, couponData);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// Fetch All Coupons Action
export const getAllCouponsAction = createAsyncThunk(
  "admin/getAllCoupons",
  async (
    { page, limit, search }: { page: number; limit: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await serverAdmin.get<CouponResponse>(
        adminEndpoints.fetchAllCoupons(page, limit, search)
      );
      console.log("API Response:", response.data);

      const { coupons, total, page: currentPage, totalPages } = response.data.data;

      if (!Array.isArray(coupons)) {
        console.error("Coupons is not an array:", coupons);
        return rejectWithValue("Invalid data format received from server");
      }

      const validCoupons = coupons.filter(
        (coupon): coupon is Coupon => coupon && typeof coupon._id === "string"
      );

      if (validCoupons.length !== coupons.length) {
        console.warn("Some coupons were invalid:", coupons);
      }

      return {
        coupons: validCoupons,
        currentPage,
        totalPages,
        totalCoupons: total,
      };
    } catch (error) {
      const err = error as AxiosError;
      console.error("Fetch coupons error:", err);
      return rejectWithValue(err.response?.data || "Failed to fetch coupons");
    }
  }
);

// Edit Coupon Action
export const editCouponAction = createAsyncThunk(
  "admin/editCoupon",
  async (
    { couponId, ...couponData }: UpdateCouponData,
    { rejectWithValue }
  ) => {
    try {
      const url = adminEndpoints.editCoupon(couponId);
      const response = await serverAdmin.put(url, couponData);
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// Delete Coupon Action (Soft Delete)
export const deleteCouponAction = createAsyncThunk(
  "admin/deleteCoupon",
  async (couponId: string, { rejectWithValue }) => {
    try {
      const url = adminEndpoints.deleteCoupon(couponId);
      const response = await serverAdmin.delete<DeleteCouponResponse>(url);
      const deletedCoupon = response.data.data;

      if (!deletedCoupon) {
        console.warn(`No coupon data returned for ID ${couponId}`);
        return { _id: couponId };
      }

      return {
        ...deletedCoupon,
        expirationDate: deletedCoupon.expirationDate
          ? deletedCoupon.expirationDate.toString()
          : "",
      };
    } catch (error) {
      const err = error as AxiosError;
      console.error(`Error deleting coupon with ID ${couponId}:`, err);
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

// Fetch Active Coupons (User)
export const getActiveCouponsUserAction = createAsyncThunk(
  "coupons/getActive",
  async (_, { rejectWithValue }) => {
    try {
      const response = await serverUser.get<CouponResponse>(userEndPoints.fetchActiveCoupons);
      console.log("User API Response:", response.data);

      const coupons = response.data.data;

      if (!Array.isArray(coupons)) {
        console.error("Coupons is not an array:", coupons);
        return rejectWithValue("Invalid data format received from server");
      }

      const validCoupons = coupons.filter(
        (coupon): coupon is Coupon => coupon && typeof coupon._id === "string"
      );

      if (validCoupons.length !== coupons.length) {
        console.warn("Some coupons were invalid:", coupons);
      }

      return validCoupons;
    } catch (error) {
      const err = error as AxiosError;
      console.error("Fetch active coupons error:", err);
      return rejectWithValue(err.response?.data || "Failed to fetch coupons");
    }
  }
);

export const checkCouponUsageAction = createAsyncThunk(
  "coupon/checkCouponUsage",
  async (couponId: string, { rejectWithValue }) => {
    try {
      const response = await serverUser.post<CheckCouponUsageResponse>(
        userEndPoints.checkCouponUsage,
        { couponId },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      console.error("Check coupon usage error:", err);
      
      // Properly extract the error message from the response
      const errorMessage = err.response?.data?.message || err.message || "Failed to check coupon usage";
      
      return rejectWithValue({
        message: errorMessage,
        status: err.response?.status
      });
    }
  }
);