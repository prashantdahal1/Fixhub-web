import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const createReview = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.REVIEWS.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create review');
    }
};

export const getReviewsByService = async (serviceId: string) => {
    try {
        const response = await axiosInstance.get(API.REVIEWS.BY_SERVICE(serviceId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch reviews');
    }
};
