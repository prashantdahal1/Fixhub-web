import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getMessagesByBooking = async (bookingId: string) => {
    try {
        const response = await axiosInstance.get(API.CHAT.BY_BOOKING(bookingId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch messages');
    }
};

export const sendMessage = async (bookingId: string, data: any) => {
    try {
        const response = await axiosInstance.post(API.CHAT.BY_BOOKING(bookingId), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to send message');
    }
};
