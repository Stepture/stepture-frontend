import React from "react";
import Link from "next/link";

const DocumentNavbar = () => {
  return (
    <header className="bg-white shadow-sm w-full">
      <nav className="flex items-center justify-between p-4   text-slate-700 max-w-[1200px] mx-auto">
        <Link
          href="/dashboard/created"
          className="flex items-center text-slate-400"
        >
          Dashboard
        </Link>
        <div className="flex items-center">{/* to implement later */}</div>
      </nav>
    </header>
  );
};

export default DocumentNavbar;
