import axios from "axios";

const DEFAULT_BACKEND_URL = "http://localhost:5000";
const BACKEND_URL = (process.env.BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, "");

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && config.headers) {
    const token = localStorage.getItem("token");
    console.log("Axios Request Interceptor - Token in localStorage:", token ? "Present" : "Missing");
    console.log("Axios Request Interceptor - Request URL:", config.url);
    console.log("Axios Request Interceptor - Full URL:", `${config.baseURL}${config.url}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Axios Request Interceptor - Authorization header set");
    } else {
      console.log("Axios Request Interceptor - No token found, not setting Authorization header");
    }
  }
  return config;
});

export default axiosInstance;