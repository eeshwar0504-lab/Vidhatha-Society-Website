// components/Providers.jsx
"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
// If you add more global providers later (ToastProvider, ThemeProvider, QueryClientProvider, etc.)
// import them here and wrap them inside this component.

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {/* 
        Add other global providers here if needed, for example:
        <ToastProvider>
        <ThemeProvider>
        ...children...
        </ThemeProvider>
        </ToastProvider>
      */}
      {children}
    </AuthProvider>
  );
}
