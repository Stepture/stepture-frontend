import React from "react";
import { getServerApi } from "@/lib/axios-server";
import DocumentDetailsList from "../components/DocumentDetailsList";
import { cookies } from "next/headers";
import { CaptureResponse } from "../document.types";
import { AxiosError } from "axios";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const fetchDocument = async (
  id: string,
  cookie?: string
): Promise<CaptureResponse | null> => {
  try {
    if (!id) {
      throw new Error("No document ID provided");
    }

    const serverApi = getServerApi(cookie);

    let isAuthenticated = false;
    let userData = null;
    try {
      userData = await serverApi.protected.getMe();
      isAuthenticated = !!userData?.user;
    } catch {
      console.log("User not authenticated, will try public endpoint");
      isAuthenticated = false;
    }

    let data;
    try {
      if (isAuthenticated) {
        // Use protected endpoint for authenticated users
        data = await serverApi.protected.getDocumentById(id);
      } else {
        // Use public endpoint for non-authenticated users
        data = await serverApi.public.getDocumentById(id);
      }
    } catch (fetchError: unknown) {
      if (
        fetchError instanceof AxiosError &&
        fetchError.response?.status === 400
      ) {
        console.log("Document is private or does not exist");
        return null;
      }
      throw fetchError;
    }

    if (!data || !data.steps) {
      console.log("No steps found for this document");
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    return null;
  }
};

const Page = async ({ params, searchParams }: Props) => {
  const { id } = await params;
  const searchParamsObj = await searchParams;
  const mode = (searchParamsObj.mode as string) || "view";
  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  const data = await fetchDocument(id, allCookies);

  if (!data) {
    // Document not found or access denied
    return (
      <div className="w-full mx-auto p-4">
        <div className="text-center text-red-500 py-10">
          <h2 className="text-xl font-semibold mb-2">Document Not Available</h2>
          <p>
            This document may be private, does not exist, or you may not have
            permission to view it.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Please check the link or contact the document owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      <div data-print-target="screenshot-viewer">
        <DocumentDetailsList
          captures={data as CaptureResponse}
          mode={mode}
          id={id}
        />
      </div>
    </div>
  );
};

export default Page;
