import React from "react";
import { getServerApi } from "@/lib/axios-server";
import { cookies } from "next/headers";
import DocumentCard from "@/components/ui/DocumentCard/DocumentCard";
import RecentlyAccessedCard from "@/components/ui/RecentlyAccessedCard/RecentlyAccessedCard";

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

interface recentlyAccessed {
  id: string;
  title: string;
  description: string;
  estimatedCompletionTime: number;
  createdAt: string;
  updatedAt: string;
  annotationColor: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    steps: number;
  };
  lastAccessedAt: string;
}

interface HomePageProps {
  totalCreated: number;
  shared: DocumentData[];
  private: DocumentData[];
  recentlyAccessed: recentlyAccessed[];
  message: string;
}

const fetchHomeDocuments = async (cookies?: string): Promise<HomePageProps> => {
  const serverApi = getServerApi(cookies);

  try {
    const documents = await serverApi.protected.getHomeDocumentsByUser();
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return {
      totalCreated: 0,
      shared: [],
      private: [],
      recentlyAccessed: [],
      message: "Error fetching documents",
    };
  }
};

const HomePage = async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();
  const documents = await fetchHomeDocuments(allCookies);

  return (
    <div className="p-12 max-w-[1200px] lg:mx-auto space-y-8">
      {/* Section 1: Total Created Documents */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Total Created Documents</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {documents?.totalCreated || 0}
            </div>
            <p className="text-gray-600">Documents created by you</p>
          </div>
        </div>
      </section>

      {/* Section 2: Shared Documents */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Shared Documents</h2>
        {documents.shared?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.shared.map((doc) => (
              <DocumentCard
                key={doc.id}
                logoSrc={"/Stepture.png"}
                websiteName="Stepture"
                docTitle={doc.title}
                author={doc.author || "bhone"}
                stepCount={doc._count.steps || 5}
                estimatedTime={doc.estimatedTime || "3 mins"}
                href={`/document/${doc.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No shared documents found.</p>
          </div>
        )}
      </section>

      {/* Section 3: Private Documents */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Private Documents</h2>
        {documents.private?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.private.map((doc) => (
              <DocumentCard
                key={doc.id}
                logoSrc={"/Stepture.png"}
                websiteName="Stepture"
                docTitle={doc.title}
                author={doc.author || "bhone"}
                stepCount={doc._count.steps || 5}
                estimatedTime={doc.estimatedTime || "3 mins"}
                href={`/document/${doc.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No private documents found.</p>
          </div>
        )}
      </section>

      {/* Section 4: Recently Accessed Documents */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Recently Accessed Documents
        </h2>
        {documents.recentlyAccessed?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.recentlyAccessed.map((doc) => (
              <RecentlyAccessedCard
                key={doc.id}
                logoSrc={"/Stepture.png"}
                websiteName="Stepture"
                docTitle={doc.title}
                author={doc.user.name || "bhone"}
                stepCount={doc._count.steps || 0}
                estimatedTime={`${Math.ceil(
                  doc.estimatedCompletionTime / 60
                )} mins`}
                lastAccessedAt={doc.lastAccessedAt}
                href={`/document/${doc.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recently accessed documents found.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
