// lib/api.ts
import axios from "axios";

/**
 * Your backend runs at http://localhost:4000
 * and exposes routes like:
 *   POST /api/uploads
 *   POST /api/auth/login
 *   CRUD /api/programs
 */
const api = axios.create({
  baseURL: "http://localhost:4000",   // FIXED — always hit your backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token on every request (browser only)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
