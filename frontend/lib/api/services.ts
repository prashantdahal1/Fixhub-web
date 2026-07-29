import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const getServices = async (params?: any) => {
    try {
        const response = await axiosInstance.get(API.SERVICES.LIST, { params });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch services');
    }
};

export const getServiceById = async (id: string) => {
    try {
        const response = await axiosInstance.get(API.SERVICES.GET(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch service');
    }
};

export const createService = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.SERVICES.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create service');
    }
};

export const updateService = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.put(API.SERVICES.UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update service');
    }
};

export const deleteService = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.SERVICES.DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete service');
    }
};

export const getServicesByProfessional = async (professionalId: string) => {
    try {
        const response = await axiosInstance.get(API.SERVICES.BY_PROFESSIONAL(professionalId));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch professional services');
    }
};
