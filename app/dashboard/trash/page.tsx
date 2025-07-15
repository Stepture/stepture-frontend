import React from "react";
import { getServerApi } from "@/lib/axios-server";
import { cookies } from "next/headers";
import TrashDocuments from "./components/TrashDocuments";

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

const fetchDeletedDocuments = async (cookie?: string): Promise<Document[]> => {
  try {
    const serverApi = getServerApi(cookie);
    const data = await serverApi.protected.getDeletedDocuments();
    console.log("Fetched deleted documents:", data);
    return data || [];
  } catch (error) {
    console.error("Failed to fetch deleted documents:", error);
    return [];
  }
};

async function TrashPage() {
  const cookieStore = cookies();
  const allCookies = cookieStore.toString();

  const deletedDocuments = await fetchDeletedDocuments(allCookies);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trash</h1>
        <p className="text-gray-600">
          Documents in trash will be permanently deleted after 30 days
        </p>
      </div>

      <TrashDocuments
        initialDocuments={deletedDocuments}
        cookieHeader={allCookies}
      />
    </div>
  );
}

export default TrashPage;
