"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Home, Save, Trash, User } from "lucide-react";
import Image from "next/image";

const NavbarLogo = () => {
  const pathname = usePathname();

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

  const currentItem = items.find((item) => item.url === pathname);
  const IconComponent = currentItem?.icon;

  return (
    <>
      <div className="flex items-center">
        {IconComponent && (
          <IconComponent className="w-4 h-4 mr-1 text-slate-800" />
        )}
      </div>
      <span className="text-slate-800 font-semibold">{currentItem?.title}</span>
    </>
  );
};

export default NavbarLogo;
