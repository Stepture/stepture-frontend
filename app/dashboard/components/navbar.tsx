import React from "react";
import NavbarLogo from "./navbarlogo";
import NavbarAvatar from "./navbarAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 border-b-1 border-slate-100 dark:border-slate-600 shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700">
      <div className="flex items-center">
        <NavbarLogo />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NavbarAvatar />
      </div>
    </nav>
  );
};

export default Navbar;
