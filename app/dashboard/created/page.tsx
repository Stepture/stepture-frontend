import React from "react";
import { getServerApi } from "@/lib/axios-server";
import { cookies } from "next/headers";
import DocumentsList from "../components/DocumentsList";

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
      <h1 className="text-xl font-bold mb-6">Documents Created by Me</h1>
      <DocumentsList initialDocuments={documents} />
    </div>
  );
};

export default page;
