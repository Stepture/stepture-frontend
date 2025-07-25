import React from "react";
import { getServerApi } from "@/lib/axios-server";
import { cookies } from "next/headers";
import DocumentCard from "@/components/ui/DocumentCard/DocumentCard";

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
}

const fetchDocument = async (cookies?: string): Promise<DocumentData[]> => {
  const serverApi = getServerApi(cookies);

  try {
    const documents = await serverApi.protected.getDocumentsByUser();
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

const page = async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();
  const documents = await fetchDocument(allCookies);

  return (
    <div className="p-12 max-w-[1200px] lg:mx-auto">
      <h1 className="text-2xl font-bold mb-6">Documents Created by Me</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            logoSrc={"/Stepture.png"} // need to replace in future
            websiteName="Stepture" // need to replace in future
            docTitle={doc.title}
            author={doc.author || "bhone"} // add in backend - current
            stepCount={doc._count.steps || 5}
            estimatedTime={doc.estimatedTime || "3 mins"} // need to replace in future
            href={`/document/${doc.id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default page;
