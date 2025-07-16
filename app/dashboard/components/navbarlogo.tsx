"use client";
import React from "react";
import { usePathname } from "next/navigation";
import {
  nav_home,
  nav_save,
  nav_trash,
  nav_user,
} from "@/public/constants/images";
import Image from "next/image";

const NavbarLogo = () => {
  const pathname = usePathname();

  const items = [
    {
      title: "Home",
      url: "/dashboard/home",
      icon: nav_home,
    },
    {
      title: "Created by me",
      url: "/dashboard/created",
      icon: nav_user,
    },
    {
      title: "Saved",
      url: "/dashboard/saved",
      icon: nav_save,
    },
    {
      title: "Trash",
      url: "/dashboard/trash",
      icon: nav_trash,
    },
  ];

  const currentItem = items.find((item) => item.url === pathname);
  const IconComponent = currentItem?.icon;

  return (
    <>
      <div className="flex items-center">
        {IconComponent && (
          <Image
            src={IconComponent}
            alt={`${currentItem?.title} Icon`}
            width={20}
            height={20}
            className="mr-2"
          />
        )}
      </div>
      <span className="text-slate-800 text-md font-semibold">
        {currentItem?.title}
      </span>
    </>
  );
};

export default NavbarLogo;
