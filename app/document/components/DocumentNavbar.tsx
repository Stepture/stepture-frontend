"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  back_arrow,
  edit_icon,
  link_share,
  arrow_share,
  nav_save,
  nav_saved,
} from "@/public/constants/images";
import Image from "next/image";
import CustomButton from "@/components/ui/Common/CustomButton";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ShareExportModal from "./ShareExportModal";
import { apiClient } from "@/lib/axios-client";
import { CaptureResponse } from "@/app/document/document.types";
import { showToast } from "@/components/ui/Common/ShowToast";

const DocumentNavbar = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "view";
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [captures, setCaptures] = useState<CaptureResponse | null>(null);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocumentAndStatus = async () => {
      if (params.id && typeof params.id === "string") {
        try {
          const response = await apiClient.protected.getDocumentById(params.id);
          setCaptures(response);

          const isSaved = await checkSavedStatus();
          setSavedStatus(isSaved);
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };
    fetchDocumentAndStatus();
  }, [params.id]);

  const saveDocument = async () => {
    if (params.id && typeof params.id === "string") {
      try {
        await apiClient.protected.saveDocument(params.id);
        setSavedStatus(true); // Update saved status after successful save
        showToast("success", "Document saved successfully.");
      } catch (error) {
        showToast("error", "Failed to save the document.");
      }
    }
  };

  const checkSavedStatus = async () => {
    if (params.id && typeof params.id === "string") {
      try {
        const response = await apiClient.protected.checkSavedStatus(params.id);
        return response.isSaved;
      } catch (error) {
        console.error("Error checking saved status:", error);
        return false;
      }
    }
    return false;
  };

  const unsaveDocument = async () => {
    console.log("Unsave document called");
    if (params.id && typeof params.id === "string") {
      try {
        await apiClient.protected.unsaveDocument(params.id);
        setSavedStatus(false);
        showToast("success", "Document unsaved successfully.");
      } catch (error) {
        showToast("error", "Failed to unsave the document.");
      }
    }
  };

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
          {mode !== "edit" && (
            <CustomButton
              label="Edit"
              icon={edit_icon}
              variant="secondary"
              size="small"
              onClick={() => {
                const id = params.id;
                router.push(`/document/${id}?mode=edit`);
              }}
            />
          )}
          <CustomButton
            label="Share"
            icon={arrow_share}
            icon2={link_share}
            variant="primary"
            size="small"
            onClick={() => setIsShareModalOpen(true)}
          />

          <CustomButton
            icon={!savedStatus ? nav_save : nav_saved}
            variant="secondary"
            onClick={!savedStatus ? saveDocument : unsaveDocument}
            label={savedStatus ? "Saved" : "Save"}
          />
        </div>
      </nav>

      {/* Share Export Modal */}
      <ShareExportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentTitle={captures?.title || "Document"}
        documentId={typeof params.id === "string" ? params.id : undefined}
        captures={captures || undefined}
      />
    </header>
  );
};

export default DocumentNavbar;
