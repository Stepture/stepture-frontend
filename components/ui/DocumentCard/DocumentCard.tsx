"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { FaLayerGroup, FaClock } from "react-icons/fa6";

interface DocumentCardProps {
  logoSrc: string;
  websiteName: string;
  docTitle: string;
  author: string;
  stepCount: number;
  estimatedTime: string;
  href: string; // Add href prop for the route
}

export default function DocumentCard({
  logoSrc,
  websiteName,
  docTitle,
  author,
  stepCount,
  estimatedTime,
  href,
}: DocumentCardProps) {
  return (
    <Link href={href} className="block w-full">
      <div className="bg-[#f8fafd] rounded-xl p-5 shadow-sm w-full border border-[#eaecef] cursor-pointer hover:shadow-lg transition-shadow duration-200">
        {/* Logo + Website Name (Top Row) */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-1 rounded-md bg-gradient-to-br from-[#e3ecff] to-[#f0f4ff]">
            <Image
              src={logoSrc}
              alt="Website logo"
              width={40}
              height={40}
              className="rounded-md"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">
            {websiteName}
          </span>
        </div>

        {/* Main Title */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4 leading-snug">
          {docTitle}
        </h2>

        {/* Author Badge */}
        <div className="inline-flex items-center gap-2 bg-[#e3ecff] text-[#3b50a1] text-sm px-3 py-1 rounded mb-4 font-medium">
          <FaUser className="w-4 h-4" />
          {author}
        </div>

        {/* Footer Info Row */}
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="w-4 h-4" />
            <span>{stepCount} Steps</span>
          </div>
          <div className="flex items-center gap-2">
            <FaClock className="w-4 h-4" />
            <span>{estimatedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUser className="w-4 h-4" />
            <span>{author}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
