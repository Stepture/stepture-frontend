"use client";
import React from "react";
import { useUser } from "./providers/UserProvider";
import Image from "next/image";
import { nav_user } from "@/public/constants/images";

const NavBarAvatar = () => {
  const { user, loading } = useUser();
  return (
    <div className="flex items-center">
      {!loading && (
        <>
          <Image
            src={nav_user}
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full mr-2 border border-gray-300"
          />
          <span className="text-slate-800 font-semibold text-sm">
            {user?.name}
          </span>
        </>
      )}
    </div>
  );
};

export default NavBarAvatar;
