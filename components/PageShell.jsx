import React from "react";

export default function PageShell({ children }) {
  return (
    <div className="bg-gradient-to-b from-[#FFF8E1] via-white to-[#E3F2FD] min-h-screen">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        {children}
      </div>
    </div>
  );
}
