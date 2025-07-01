import React from "react";
import { getServerApi } from "@/lib/axios-server";
import ScreenshotViewer from "../components/ScreeshotViewer";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

interface CaptureData {
  tab: any;
  screenshot: string;
  info: ElementInfo;
}

interface ElementInfo {
  textContent: string;
  coordinates: {
    viewport: { x: number; y: number };
  };
  captureContext?: {
    devicePixelRatio: number;
    viewportWidth: number;
    viewportHeight: number;
    screenWidth: number;
    screenHeight: number;
  };
}

const fetchDocument = async (
  id: string,
  cookie?: string
): Promise<CaptureData[]> => {
  try {
    if (!id) {
      throw new Error("No document ID provided");
    }

    const serverApi = getServerApi(cookie);
    const data = await serverApi.protected.getDocumentById(id);

    if (!data || !data.steps) {
      throw new Error("No steps found for this document");
    }

    // Transform API steps to CaptureData[]
    const mapped = data.steps.map((step: any) => ({
      tab: null,
      screenshot: step.screenshot?.url || "",
      info: {
        textContent: step.stepDescription || "",
        coordinates: {
          viewport: {
            x: step.screenshot?.viewportX || 0,
            y: step.screenshot?.viewportY || 0,
          },
        },
        captureContext: {
          devicePixelRatio: step.screenshot?.devicePixelRatio || 1,
          viewportWidth: step.screenshot?.viewportWidth || 0,
          viewportHeight: step.screenshot?.viewportHeight || 0,
          screenWidth: step.screenshot?.viewportWidth || 0,
          screenHeight: step.screenshot?.viewportHeight || 0,
        },
      },
    }));

    return mapped;
  } catch (error) {
    console.error("Failed to fetch document:", error);
    throw error;
  }
};

const Page = async ({ params }: Props) => {
  const { id } = await params;

  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  try {
    const captures = await fetchDocument(id, allCookies);

    return (
      <div className="w-full max-w-[800px] mx-auto p-4">
        <ScreenshotViewer initialCaptures={captures} />
      </div>
    );
  } catch (error) {
    return (
      <div className="w-full max-w-[800px] mx-auto p-4">
        <div className="text-center text-red-500 py-10">
          {error instanceof Error ? error.message : "Failed to load document"}
        </div>
      </div>
    );
  }
};

export default Page;
