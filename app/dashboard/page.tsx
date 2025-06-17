"use client"; // lazy to make a server component for this, so just use client component :3

import React from "react";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      // Add your logout logic here
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/auth/logout`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      console.log("Logout response:", res);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <div>You are authenticated</div>
      <button onClick={handleLogout}>Logout</button>
      <div>Dashboard Page</div>
    </div>
  );
};

export default page;
