import React from "react";
import { getServerApi } from "@/lib/axios-server";
import ScreenshotViewer from "../components/ScreenshotViewer";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

interface User {
  id: string;
  name: string;
  email: string;
}
interface Screenshot {
  id: string;
  googleImageId: string;
  url: string;
  viewportX: number;
  viewportY: number;
  viewportHeight: number;
  viewportWidth: number;
  devicePixelRatio: number;
  createdAt: string;
  stepId: string;
}

interface Step {
  id: string;
  stepDescription: string;
  stepNumber: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  documentId: string;
  screenshot: Screenshot | null;
}
interface CaptureResponse {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  steps: Step[];
  user: User;
}

const fetchDocument = async (
  id: string,
  cookie?: string
): Promise<CaptureResponse> => {
  try {
    if (!id) {
      throw new Error("No document ID provided");
    }

    const serverApi = getServerApi(cookie);
    const data = await serverApi.protected.getDocumentById(id);

    if (!data || !data.steps) {
      throw new Error("No steps found for this document");
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    throw error;
  }
};

const Page = async ({ params, searchParams }: Props) => {
  const { id } = await params;
  const searchParamsObj = await searchParams;
  const mode = (searchParamsObj.mode as string) || "view";
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  try {
    const data = await fetchDocument(id, allCookies);

    return (
      <div className="w-full mx-auto p-4">
        <ScreenshotViewer
          captures={data as CaptureResponse}
          mode={mode}
          id={id}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="w-full mx-auto p-4">
        <div className="text-center text-red-500 py-10">
          {error instanceof Error ? error.message : "Failed to load document"}
        </div>
      </div>
    );
  }
};

export default Page;
