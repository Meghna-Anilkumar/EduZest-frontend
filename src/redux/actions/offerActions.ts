import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminEndpoints } from "../../services/endPoints/endPoints";
import { serverAdmin } from "../../services";
import { AxiosError } from "axios";
import { Offer } from "@/components/admin/Offers";

interface OfferResponse {
    data: {
        offers: Offer[];
        total: number;
        page?: number;
        totalPages?: number;
    };
    message: string;
    success: boolean;
}

interface CreateOfferData {
    discountPercentage: number;
    maxDiscountAmount?: number;
    minPurchaseAmount?: number;
    expirationDate: string;
    categoryId: string;
}

interface UpdateOfferData {
    offerId: string;
    discountPercentage: number;
    maxDiscountAmount?: number;
    minPurchaseAmount?: number;
    expirationDate: string;
    categoryId: string;
}

interface DeleteOfferResponse {
    data: Offer | null;
    message: string;
    success: boolean;
}

// Create Offer Action
export const createOfferAction = createAsyncThunk(
    "admin/createOffer",
    async (offerData: CreateOfferData, { rejectWithValue }) => {
        try {
            const response = await serverAdmin.post(adminEndpoints.createOffer, offerData);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Fetch All Offers Action
export const getAllOffersAction = createAsyncThunk(
    "admin/getAllOffers",
    async (
        { page, limit, search }: { page: number; limit: number; search?: string },
        { rejectWithValue }
    ) => {
        try {
            const endpoint = adminEndpoints.fetchAllOffers(page, limit, search);
            console.log("🚀 Full endpoint being called:", endpoint);
            console.log("🚀 Base URL:", serverAdmin.defaults.baseURL);
            const response = await serverAdmin.get<OfferResponse>(endpoint);
            console.log("API Response:", response.data);

            const { offers, total, page: currentPage, totalPages } = response.data.data;

            if (!Array.isArray(offers)) {
                console.error("Offers is not an array:", offers);
                return rejectWithValue("Invalid data format received from server");
            }

            const validOffers = offers.filter(
                (offer): offer is Offer => offer && typeof offer._id === "string"
            );

            if (validOffers.length !== offers.length) {
                console.warn("Some offers were invalid:", offers);
            }

            return {
                offers: validOffers,
                currentPage,
                totalPages,
                totalOffers: total,
            };
        } catch (error) {
            const err = error as AxiosError;
            console.error("Fetch offers error:", err);
            return rejectWithValue(err.response?.data || "Failed to fetch offers");
        }
    }
);

// Edit Offer Action
export const editOfferAction = createAsyncThunk(
    "admin/editOffer",
    async (
        { offerId, ...offerData }: UpdateOfferData,
        { rejectWithValue }
    ) => {
        try {
            const url = adminEndpoints.editOffer(offerId);
            const response = await serverAdmin.put(url, offerData);
            return response.data.data;
        } catch (error) {
            const err = error as AxiosError;
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);

// Delete Offer Action 
export const deleteOfferAction = createAsyncThunk(
    "admin/deleteOffer",
    async (offerId: string, { rejectWithValue }) => {
        try {
            const url = adminEndpoints.deleteOffer(offerId);
            const response = await serverAdmin.delete<DeleteOfferResponse>(url);
            const deletedOffer = response.data.data;

            if (!deletedOffer) {
                console.warn(`No offer data returned for ID ${offerId}`);
                return { _id: offerId };
            }

            return {
                ...deletedOffer,
                expirationDate: deletedOffer.expirationDate
                    ? deletedOffer.expirationDate.toString()
                    : "",
            };
        } catch (error) {
            const err = error as AxiosError;
            console.error(`Error deleting offer with ID ${offerId}:`, err);
            return rejectWithValue(err.response?.data || { message: err.message });
        }
    }
);