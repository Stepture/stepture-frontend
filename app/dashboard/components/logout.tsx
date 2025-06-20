"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios-client";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await apiClient.protected.logout();
      router.push("/login");
    } catch (error) {
      // Optionally handle error
    }
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer"
    >
      Logout
    </button>
  );
};

export default Logout;
