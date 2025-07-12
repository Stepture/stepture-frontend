"use client";
import { Home, Save, Trash, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logout from "./logout";
import { useUser } from "./providers/userProvider";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/axios-client";
// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard/home",
    icon: Home,
  },
  {
    title: "Created by me",
    url: "/dashboard/created",
    icon: User,
  },
  {
    title: "Saved",
    url: "/dashboard/saved",
    icon: Save,
  },
  {
    title: "Trash",
    url: "/dashboard/trash",
    icon: Trash,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;
  const { user } = useUser();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.name}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={`transition-colors duration-200 my-1 rounded-md ${
                    isActive(item.url) ? "bg-blue-custom" : ""
                  }`}
                >
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`${isActive(item.url) ? "text-white" : ""}`}
                    >
                      <item.icon />
                      <span className="text-md">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="flex items-center justify-center mt-auto mb-4">
        <Logout />
      </div>
    </Sidebar>
  );
}
