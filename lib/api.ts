// lib/api.ts
import axios from "axios";

/**
 * Backend baseURL (your backend runs on localhost:4000)
 * IMPORTANT: Do NOT set a default Content-Type here so FormData uploads work.
 */
const api = axios.create({
  baseURL: "http://localhost:4000",
  // no default Content-Type (let browser set it automatically for FormData)
  // If your backend uses cookie-based sessions, you can enable credentials:
  // withCredentials: true,
});

// Helper to set/remove Authorization header from other modules (AuthContext)
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Attach token on every request (browser only)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      // only set Authorization if not already set by setAuthToken
      if (!config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    // If config.headers contains a Content-Type set globally somewhere else, delete it for FormData auto-handling:
    // (we keep this safe-guard; it won't break JSON requests)
    // Note: We only remove content-type when request.data is a FormData instance.
    try {
      if (config.data && typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (config.headers && config.headers["Content-Type"]) {
          delete config.headers["Content-Type"];
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

export default api;
