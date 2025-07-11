"use client";

import ScreenshotViewer from "@/app/document/components/ScreenshotViewer";

const dummySteps = [
  {
    tab: "",
    screenshot: "/sample1.png", // replace with real public path or remote URL
    info: {
      textContent: "Navigate to this site https://vms.au.edu/",
      coordinates: {
        viewport: { x: 0, y: 0 },
      },
      captureContext: {
        devicePixelRatio: 2,
        viewportWidth: 1280,
        viewportHeight: 720,
      },
    },
  },
  {
    tab: "",
    screenshot: "/sample2.png", // replace with real public path or remote URL
    info: {
      textContent: "Click here",
      coordinates: {
        viewport: { x: 0, y: 0 },
      },
      captureContext: {
        devicePixelRatio: 2,
        viewportWidth: 1280,
        viewportHeight: 720,
      },
    },
  },
];

const mockMetadata = {
  title: "Checking Through Vincent Mary School of Science and Technology",
  description:
    "This walkthrough provides a simple and effective process for navigating the Vincent Mary School of Science and Technology (VMS) website, allowing users to easily explore available majors, subject offerings, and academic structures. It highlights key sections of the site and guides users through accessing curriculum details and program requirements. By following this walkthrough, students can better understand their academic options and make more informed decisions about their studies.",
  author: "MB Triad",
  stepCount: 22,
  estimatedTime: "20 Minutes",
};

export default function WalkthroughTestPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <ScreenshotViewer initialCaptures={dummySteps} metadata={mockMetadata} />
    </div>
  );
}
