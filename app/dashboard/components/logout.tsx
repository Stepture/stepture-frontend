"use client";
import React from "react";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      const res = await fetch(`http://localhost:8000/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("Logout response:", res);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
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
