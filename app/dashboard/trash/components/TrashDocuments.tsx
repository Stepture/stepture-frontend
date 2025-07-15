"use client";

import React, { useState, useTransition } from "react";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import DocumentCardSkeleton from "@/components/ui/Skeleton/DocumentCardSkeleton";
import { apiClient } from "@/lib/axios-client";

interface Document {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDeleted: boolean;
  deletedAt: string;
  _count: {
    steps: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TrashDocumentsProps {
  initialDocuments: Document[];
  cookieHeader: string;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle
            className={`w-6 h-6 ${
              isDestructive ? "text-red-500" : "text-amber-500"
            }`}
          />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md transition-colors ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const TrashDocumentCard: React.FC<{
  document: Document;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  isLoading: boolean;
}> = ({ document, onRestore, onPermanentDelete, isLoading }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[#f8fafd] rounded-xl p-5 shadow-sm w-full border border-[#eaecef] opacity-75">
      {/* Header with logo and website name */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-1 rounded-md bg-gradient-to-br from-[#e3ecff] to-[#f0f4ff]">
          <img
            src="/Stepture.png"
            alt="Website logo"
            className="w-10 h-10 rounded-md object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/file.svg";
            }}
          />
        </div>
        <span className="text-sm text-gray-500 font-medium">Stepture</span>
      </div>

      {/* Document title */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
        {document.title || "Untitled Document"}
      </h3>

      {/* Document metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
        {document._count.steps && <span>{document._count.steps} steps</span>}
        <span>3 mins</span>
        {document.user.name && <span>by {document.user.name}</span>}
      </div>

      {/* Deletion info */}
      <div className="text-sm text-gray-500 mb-4">
        Deleted on {formatDate(document.deletedAt)}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onRestore(document.id)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Restore
        </button>
        <button
          onClick={() => onPermanentDelete(document.id)}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Delete Forever
        </button>
      </div>
    </div>
  );
};

const TrashDocuments: React.FC<TrashDocumentsProps> = ({
  initialDocuments,
  cookieHeader,
}) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isPending, startTransition] = useTransition();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "restore" | "delete";
    documentId: string;
    documentTitle: string;
  }>({
    isOpen: false,
    type: "restore",
    documentId: "",
    documentTitle: "",
  });

  const showConfirmDialog = (
    type: "restore" | "delete",
    documentId: string,
    documentTitle: string
  ) => {
    setConfirmDialog({
      isOpen: true,
      type,
      documentId,
      documentTitle,
    });
  };

  const hideConfirmDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: "restore",
      documentId: "",
      documentTitle: "",
    });
  };

  const handleRestore = async (id: string) => {
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      await apiClient.protected.restoreDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to restore document:", error);
      alert("Failed to restore document. Please try again.");
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handlePermanentDelete = async (id: string) => {
    setLoadingIds((prev) => new Set(prev).add(id));

    try {
      await apiClient.protected.permanentlyDeleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to permanently delete document:", error);
      alert("Failed to permanently delete document. Please try again.");
    } finally {
      setLoadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleConfirmAction = () => {
    if (confirmDialog.type === "restore") {
      handleRestore(confirmDialog.documentId);
    } else {
      handlePermanentDelete(confirmDialog.documentId);
    }
    hideConfirmDialog();
  };

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <DocumentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Trash is empty
        </h3>
        <p className="text-gray-600">
          No deleted documents found. Documents you delete will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <TrashDocumentCard
            key={document.id}
            document={document}
            onRestore={(id) => showConfirmDialog("restore", id, document.title)}
            onPermanentDelete={(id) =>
              showConfirmDialog("delete", id, document.title)
            }
            isLoading={loadingIds.has(document.id)}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={
          confirmDialog.type === "restore"
            ? "Restore Document"
            : "Permanently Delete Document"
        }
        message={
          confirmDialog.type === "restore"
            ? `Are you sure you want to restore "${confirmDialog.documentTitle}"? It will be moved back to your documents.`
            : `Are you sure you want to permanently delete "${confirmDialog.documentTitle}"? This action cannot be undone.`
        }
        confirmText={
          confirmDialog.type === "restore" ? "Restore" : "Delete Forever"
        }
        onConfirm={handleConfirmAction}
        onCancel={hideConfirmDialog}
        isDestructive={confirmDialog.type === "delete"}
      />
    </>
  );
};

export default TrashDocuments;
