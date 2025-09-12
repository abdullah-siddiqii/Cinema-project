"use client";

import React, { useState, useEffect } from "react";

interface HomeWrapperProps {
  children: React.ReactNode;
}
export default function HomeWrapper({ children }: HomeWrapperProps) {

  const [loading, setLoading] = useState(true);

  // Simulated loading state (replace with real logic)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
      </div>
    );
  }

  return <>{children}</>;
}
