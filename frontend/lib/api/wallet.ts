import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getWallet = async () => {
    try {
        const response = await axiosInstance.get(API.WALLET.GET);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch wallet');
    }
};

export const topupWallet = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.WALLET.TOPUP, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to topup wallet');
    }
};

export const initiatePayment = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.WALLET.INITIATE_PAYMENT, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to initiate payment');
    }
};
