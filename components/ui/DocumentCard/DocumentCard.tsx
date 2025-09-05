"use client";

import { Trash, RotateCcw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import { FaLayerGroup, FaClock } from "react-icons/fa6";
import CustomAlertDialog from "../Common/CustomAlertDialog";
import { apiClient } from "@/lib/axios-client";
import { useState } from "react";
import { showToast } from "../Common/ShowToast";

interface DocumentData {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    steps: number;
  };
}

interface DocumentCardProps {
  logoSrc: string;
  websiteName: string;
  docTitle: string;
  author: string;
  stepCount: number;
  estimatedTime: string;
  href: string;
  page?: string;
  docs?: DocumentData[]; // Keep for backward compatibility
  documentId?: string;
  onDelete?: (id: string) => void;
}

export default function DocumentCard({
  logoSrc,
  websiteName,
  docTitle,
  author,
  stepCount,
  estimatedTime,
  href,
  page,
  documentId,
  onDelete,
}: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteDocument = async () => {
    if (isDeleting) return;

    // Get the document ID from either prop or href
    const docId = documentId || href.split("/").pop() || "";

    if (!docId) {
      console.error("No document ID found");
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.protected.deleteDocument(docId);
      showToast("success", "Document moved to trash.");
      if (onDelete) {
        onDelete(docId);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      showToast("error", "Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteDocumentPermanently = async () => {
    if (isDeleting) return;
    const docId = documentId || href.split("/").pop() || "";

    if (!docId) {
      console.error("No document ID found");
      return;
    }

    try {
      setIsDeleting(true);
      await apiClient.protected.deleteDocumentPermanently(docId);
      showToast("success", "Document deleted permanently.");
      if (onDelete) {
        onDelete(docId);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting document permanently:", error);
      showToast("error", "Failed to delete document permanently.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-[#f8fafd] rounded-xl p-5 shadow-sm w-full border border-[#eaecef] cursor-pointer hover:shadow-lg transition-shadow duration-200 relative">
      <Link href={href} className="block w-full">
        <div>
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
          </div>
        </div>
      </Link>
      <div className="absolute top-3 right-3 flex">
        {page === "trash" && (
          <div className="bg-slate-100 rounded-lg">
            <CustomAlertDialog
              title="Restore Document"
              description={`Are you sure you want to restore "${docTitle}" from trash?`}
              onConfirm={async () => {
                if (isDeleting) return;
                const docId = documentId || href.split("/").pop() || "";

                if (!docId) {
                  console.error("No document ID found");
                  return;
                }

                try {
                  setIsDeleting(true);
                  await apiClient.protected.restoreDocument(docId);
                  showToast("success", "Document restored successfully.");
                  if (onDelete) {
                    onDelete(docId);
                  } else {
                    window.location.reload();
                  }
                } catch (error) {
                  console.error("Error restoring document:", error);
                  showToast("error", "Failed to restore document.");
                } finally {
                  setIsDeleting(false);
                }
              }}
              triggerDescription={
                <RotateCcw
                  aria-label="Restore document"
                  role="button"
                  className={`w-4 h-4 m-2 cursor-pointer transition-colors ${
                    isDeleting
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-500 hover:text-green-700"
                  }`}
                />
              }
            />
          </div>
        )}

        {(page === "created" || page === "trash") && (
          <div className=" bg-slate-100 rounded-lg">
            <CustomAlertDialog
              title={
                page === "created" ? "Delete Document" : "Delete Permanently"
              }
              description={
                page === "created"
                  ? `Are you sure you want to delete "${docTitle}"? This document will be moved to trash.`
                  : "Are you sure you want to permanently delete this document? This action cannot be undone."
              }
              onConfirm={
                page === "created" ? deleteDocument : deleteDocumentPermanently
              }
              triggerDescription={
                <Trash
                  aria-label="Delete document"
                  role="button"
                  className={`w-4 h-4 m-2 cursor-pointer transition-colors ${
                    isDeleting
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-red-500 hover:text-red-700"
                  }`}
                />
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
