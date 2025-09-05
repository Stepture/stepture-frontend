"use client";

import React, { useState } from "react";
import DocumentCard from "@/components/ui/DocumentCard/DocumentCard";

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

interface DocumentsListProps {
  initialDocuments: DocumentData[];
}

const DocumentsList: React.FC<DocumentsListProps> = ({ initialDocuments }) => {
  const [documents, setDocuments] = useState<DocumentData[]>(initialDocuments);

  const handleDeleteDocument = (deletedId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== deletedId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          logoSrc={"/Stepture.png"}
          websiteName="Stepture"
          docTitle={doc.title}
          author={doc?.user?.name || "Unknown Author"}
          stepCount={doc._count.steps || 5}
          estimatedTime={doc.estimatedTime || "3 mins"}
          href={`/document/${doc.id}`}
          page="created"
          documentId={doc.id}
          onDelete={handleDeleteDocument}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
