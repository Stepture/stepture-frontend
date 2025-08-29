"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ShareExportModalProps, TabType } from "../document.types";
import { useShareStatusManager } from "../utils/useDocumentSharing";
import { usePDFExporter } from "../utils/exportUtils";
import { useMarkdownExporter } from "../utils/markdownUtils";
import ShareTab from "./ShareExportModal/ShareTab";
import ExportTab from "./ShareExportModal/ExportTab";

const ShareExportModal: React.FC<ShareExportModalProps> = ({
  isOpen,
  onClose,
  captures,
  documentTitle = "Document",
  documentId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("share");
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isPublic, setIsPublic] = useState(captures?.isPublic || false);
  const [isUpdatingShareStatus, setIsUpdatingShareStatus] = useState(false);

  const { handleToggleShareStatus, handleCopyLink } = useShareStatusManager();
  const { handlePDFExport } = usePDFExporter();
  const { handleMarkdownExport } = useMarkdownExporter();

  // Update local state when captures changes
  useEffect(() => {
    if (captures?.isPublic !== undefined) {
      setIsPublic(captures.isPublic);
    }
  }, [captures?.isPublic]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onToggleShareStatus = () =>
    handleToggleShareStatus(
      documentId,
      isPublic,
      setIsPublic,
      setIsUpdatingShareStatus
    );

  const onPDFExport = () =>
    handlePDFExport(captures, documentTitle, setIsLoadingPDF);

  const onMarkdownExport = () => handleMarkdownExport(captures, documentTitle);

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[9999] h-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Share & Export</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setActiveTab("share")}
            className={`flex-1 py-4 px-8 text-sm font-medium transition-all duration-200 min-h-[52px] flex items-center justify-center ${
              activeTab === "share"
                ? "text-gray-900 bg-gray-50 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Share
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex-1 py-4 px-8 text-sm font-medium transition-all duration-200 min-h-[52px] flex items-center justify-center ${
              activeTab === "export"
                ? "text-gray-900 bg-gray-50 border-b-2 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Export
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[200px]">
          {activeTab === "share" && (
            <ShareTab
              documentId={documentId}
              isPublic={isPublic}
              isUpdatingShareStatus={isUpdatingShareStatus}
              onToggleShareStatus={onToggleShareStatus}
              onCopyLink={handleCopyLink}
            />
          )}

          {activeTab === "export" && (
            <ExportTab
              captures={captures}
              documentTitle={documentTitle}
              isLoadingPDF={isLoadingPDF}
              onPDFExport={onPDFExport}
              onMarkdownExport={onMarkdownExport}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareExportModal;
