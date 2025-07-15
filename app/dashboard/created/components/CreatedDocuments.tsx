"use client";

import React, { useState } from "react";
import DocumentCardWithActions from "@/components/ui/DocumentCard/DocumentCardWithActions";
import { apiClient } from "@/lib/axios-client";

interface DocumentData {
  id: string;
  title: string;
  description: string;
  userId: string;
  _count: {
    steps: number;
  };
  estimatedTime: string;
  author?: string;
  user: {
    name: string;
  };
}

interface CreatedDocumentsProps {
  initialDocuments: DocumentData[];
}

const CreatedDocuments: React.FC<CreatedDocumentsProps> = ({
  initialDocuments,
}) => {
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      await apiClient.protected.deleteDocument(id);
      // Remove the document from the list after successful deletion
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📄</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No documents yet
        </h3>
        <p className="text-gray-600">
          You haven't created any documents yet. Start creating your first
          document!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentCardWithActions
          key={doc.id}
          id={doc.id}
          logoSrc={"/Stepture.png"} // need to replace in future
          websiteName="Stepture" // need to replace in future
          docTitle={doc.title}
          author={doc.user.name || "bhone"} // add in backend - current
          stepCount={doc._count.steps || 5}
          estimatedTime={doc.estimatedTime || "3 mins"} // need to replace in future
          href={`/document/${doc.id}`}
          onDelete={handleDelete}
          isDeleting={deletingIds.has(doc.id)}
        />
      ))}
    </div>
  );
};

export default CreatedDocuments;
