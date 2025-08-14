"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Logout from "./logout";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard/home",
    icon: "/Home.png",
    iconActive: "/Homefilled.png",
  },
  {
    title: "Created by me",
    url: "/dashboard/created",
    icon: "/Createdby.png",
    iconActive: "/Createdbyfilled.png",
  },
  {
    title: "Saved",
    url: "/dashboard/saved",
    icon: "/Saved.png",
    iconActive: "/Savedfilled.png",
  },
  {
    title: "Trash",
    url: "/dashboard/trash",
    icon: "/Trash.png",
    iconActive: "/Trashfilled.png",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (url: string) => pathname === url;

  return (
    <Sidebar>
      <SidebarContent>
        {/* Logo */}
        <SidebarGroup className="px-0 pt-2 pb-2">
          <div className="flex justify-start">
            <Image
              src="/SteptureLogo.png"
              alt="Stepture Logo"
              width={100}
              height={100}
              className="ml-2"
            />
          </div>
        </SidebarGroup>

        {/* Menu */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={`transition-none my-1 rounded-md ${
                    isActive(item.url) ? "bg-blue-custom font-semibold" : ""
                  }`}
                >
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 text-white"
                    >
                      <Image
                        src={isActive(item.url) ? item.iconActive : item.icon}
                        alt={`${item.title} Icon`}
                        width={20}
                        height={20}
                      />
                      <span className="text-md">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <SidebarMenu className="mt-auto mb-4">
          <SidebarMenuItem>
            <Logout />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
