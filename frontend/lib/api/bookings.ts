import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getBookings = async (params?: any) => {
    try {
        const response = await axiosInstance.get(API.BOOKINGS.LIST, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch bookings');
    }
};

export const getBookingById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.BOOKINGS.GET(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch booking');
    }
};

export const createBooking = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.BOOKINGS.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create booking');
    }
};

export const updateBookingStatus = async (id: string, action: 'confirm' | 'start' | 'complete' | 'cancel') => {
    try {
        const response = await axiosInstance.patch(API.BOOKINGS.STATUS(id), { action });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update booking status');
    }
};
