import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

export const createTicket = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.TICKETS.CREATE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to create ticket');
    }
};

export const getAdminTickets = async () => {
    try {
        const response = await axiosInstance.get(API.TICKETS.ADMIN_GET_ALL);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch tickets');
    }
};

export const updateTicketStatus = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.patch(API.TICKETS.ADMIN_UPDATE_STATUS(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update ticket status');
    }
};

export const updateTicket = async (id: string, data: any) => {
    try {
        const response = await axiosInstance.patch(API.TICKETS.ADMIN_UPDATE(id), data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to update ticket');
    }
};

export const deleteTicket = async (id: string) => {
    try {
        const response = await axiosInstance.delete(API.TICKETS.ADMIN_DELETE(id));
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to delete ticket');
    }
};

export const bulkDeleteTickets = async (data: any) => {
    try {
        const response = await axiosInstance.post(API.TICKETS.ADMIN_BULK_DELETE, data);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to bulk delete tickets');
    }
};

export const getTicketDeletions = async () => {
    try {
        const response = await axiosInstance.get(API.TICKET_DELETIONS.ADMIN_GET_ALL);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error?.response?.data?.message || 'Failed to fetch ticket deletions');
    }
};
