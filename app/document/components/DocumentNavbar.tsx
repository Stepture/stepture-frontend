import React from "react";
import Link from "next/link";
import {
  back_arrow,
  edit_icon,
  link_share,
  arrow_share,
  nav_save,
} from "@/public/constants/images";
import Image from "next/image";
import CustomButton from "@/components/ui/CustomButton";

const DocumentNavbar = () => {
  return (
    <header className="bg-white shadow-sm w-full">
      <nav className="flex items-center justify-between p-4 text-slate-700 max-w-[1200px] mx-auto">
        <Link
          href="/dashboard/created"
          className="flex items-center text-slate-400 text-sm hover:scale-110 transition-ease-in duration-400"
        >
          <Image
            src={back_arrow}
            alt="Back Arrow"
            width={24}
            height={24}
            className="mr-2"
          />
          Dashboard
        </Link>
        <div className="flex items-center">
          <CustomButton
            label="Edit"
            icon={edit_icon}
            variant="secondary"
            size="small"
          />
          <CustomButton
            label="Share"
            icon={arrow_share}
            icon2={link_share}
            variant="primary"
            size="small"
          />
          <CustomButton icon={nav_save} variant="secondary" />
        </div>
      </nav>
    </header>
  );
};

export default DocumentNavbar;
