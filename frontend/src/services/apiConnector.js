import axios from "axios";

// Create a new axios instance
export const axiosInstance = axios.create({
  baseURL: "https://paytmbackend.vercel.app", // Set the base URL for all requests
  headers: {
    "Content-Type": "application/json", // Default content type
  },
});

// API connector function
export const apiConnector = async (method, url, bodyData = {}, headers = {}, params = {}) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data: bodyData,
      headers,
      params,
    });
    return response;
  } catch (error) {
    console.error("API request error:", error.message);
    if (error.response) {
      // Handle known errors, like a 4xx or 5xx response
      console.error("API response error:", error.response.data);
      throw new Error(error.response.data.message || "An error occurred");
    } else {
      // Handle network errors or unexpected issues
      throw new Error("Network error or server is not responding");
    }
  }
};
