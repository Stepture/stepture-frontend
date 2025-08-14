"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios-client";
import Image from "next/image";
import { SidebarMenuButton } from "@/components/ui/sidebar";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await apiClient.protected.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarMenuButton
      onClick={handleLogout}
      className="flex items-center gap-2 text-white"
    >
      <Image src="/logout.png" alt="Logout" width={20} height={20} />
      <span className="text-md">Log Out</span>
    </SidebarMenuButton>
  );
};

export default Logout;
