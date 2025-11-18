// API configuration
// In production we want the client to call the backend using a relative path
// (so the same origin serves both the SPA and the API). During local
// development Vite proxies `/api` to the backend. If you need a custom
// backend URL at build time, set `VITE_APP_API_URL` in your environment.
const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "";

export default API_BASE_URL;

// Helper function to make API requests with consistent error handling
export const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return response;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};
