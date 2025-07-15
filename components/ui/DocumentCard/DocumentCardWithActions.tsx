"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUser, FaTrash } from "react-icons/fa";
import { FaLayerGroup, FaClock } from "react-icons/fa6";
import { useState } from "react";

interface DocumentCardWithActionsProps {
  id: string;
  logoSrc: string;
  websiteName: string;
  docTitle: string;
  author: string;
  stepCount: number;
  estimatedTime: string;
  href: string;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export default function DocumentCardWithActions({
  id,
  logoSrc,
  websiteName,
  docTitle,
  author,
  stepCount,
  estimatedTime,
  href,
  onDelete,
  isDeleting = false,
}: DocumentCardWithActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative group">
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

      {/* Delete Button - Appears on hover */}
      <button
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="absolute top-3 right-3 p-2 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete document"
      >
        <FaTrash className="w-4 h-4" />
      </button>

      {/* Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Document
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{docTitle}"? It will be moved to
              trash and can be restored later.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
