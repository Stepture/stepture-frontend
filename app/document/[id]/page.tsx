import React from "react";
import { getServerApi } from "@/lib/axios-server";
import ScreenshotViewer from "../components/ScreenshotViewer";
import { cookies } from "next/headers";

type Props = {
  params: {
    id: string;
  };
};

interface CaptureData {
  tab: string;
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
    screenWidth?: number;
    screenHeight?: number;
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

    // If backend unavailable, return dummy steps
    return [
      {
        tab: null,
        screenshot: "/screenshot1.png", // Replace with local image if needed
        info: {
          textContent: "Navigate to this site https://vms.au.edu/",
          coordinates: {
            viewport: { x: 0, y: 0 },
          },
          captureContext: {
            devicePixelRatio: 2,
            viewportWidth: 1280,
            viewportHeight: 800,
          },
        },
      },
      {
        tab: null,
        screenshot: "/screenshot2.png",
        info: {
          textContent: "Click on the menu icon",
          coordinates: {
            viewport: { x: 100, y: 150 },
          },
          captureContext: {
            devicePixelRatio: 2,
            viewportWidth: 1280,
            viewportHeight: 800,
          },
        },
      },
    ];
  } catch (error) {
    console.error("Failed to fetch document:", error);
    throw error;
  }
};

const Page = async ({ params }: Props) => {
  const { id } = params;

  const cookieStore = await cookies();
  const allCookies = cookieStore.toString();

  try {
    const captures = await fetchDocument(id, allCookies);

    const dummyMetadata = {
      title: "Checking Through Vincent Mary School of Science and Technology",
      description:
        "This walkthrough provides a simple and effective process for navigating the Vincent Mary School of Science and Technology (VMS) website...",
      author: "MB Triad",
      stepsCount: captures.length,
      estimatedTime: "20 Minutes",
    };

    return (
      <div className="w-full max-w-[800px] mx-auto p-4">
        <ScreenshotViewer initialCaptures={captures} metadata={dummyMetadata} />
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
