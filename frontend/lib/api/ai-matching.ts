import axiosInstance from "./axios-instance";
import { API } from "./endpoints";

// Test function to verify backend connectivity
export const testBackend = async () => {
  try {
    const response = await axiosInstance.get('/api/v1/ai-matching/test');
    console.log("Backend test response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Backend test failed:", error);
    throw error;
  }
};

export const findBestMatches = async (data: {
  serviceCategory: string;
  customerLocation?: {
    city: string;
    province: string;
    coordinates?: { lat: number; lng: number };
  };
  maxResults?: number;
}) => {
  try {
    console.log("=== AI Matching Request Debug ===");
    console.log("Request data:", data);
    console.log("Request URL:", API.AI_MATCHING.FIND_MATCHES);
    
    const response = await axiosInstance.post(API.AI_MATCHING.FIND_MATCHES, data);
    
    console.log("AI Matching Response:", response.data);
    console.log("Response status:", response.status);
    return response.data;
  } catch (error: Error | any) {
    console.error("=== AI Matching Error Debug ===");
    console.error("Error:", error);
    console.error("Error response:", error.response);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    console.error("Error headers:", error.response?.headers);
    
    if (error?.response?.status === 401) {
      throw new Error('Please log in to use AI matching');
    }
    throw new Error(error?.response?.data?.message || 'Failed to find matches');
  }
};

export const getProfessionalAnalytics = async (professionalId: string) => {
  try {
    const response = await axiosInstance.get(API.AI_MATCHING.ANALYTICS(professionalId));
    return response.data;
  } catch (error: Error | any) {
    if (error?.response?.status === 401) {
      throw new Error('Please log in to view analytics');
    }
    throw new Error(error?.response?.data?.message || 'Failed to get analytics');
  }
};
