"use client";

import { useState, useEffect } from "react";
import StoryReader from "@/components/StoryReader";
import AppHeader from "@/components/AppHeader";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleProfileChange = () => setRefreshKey((k) => k + 1);
    window.addEventListener("bs-profile-changed", handleProfileChange);
    return () => window.removeEventListener("bs-profile-changed", handleProfileChange);
  }, []);

  return (
    <>
      <AppHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-28">
        <StoryReader key={refreshKey} />
      </main>
    </>
  );
}
