import React from "react";
import NavbarLogo from "./navbarlogo";
import NavbarAvatar from "./navbarAvatar";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 border-b-1 border-slate-100 shadow-sm  text-slate-700">
      <div className="flex items-center">
        <NavbarLogo />
      </div>
      <div className="flex items-center">
        <NavbarAvatar />
      </div>
    </nav>
  );
};

export default Navbar;
