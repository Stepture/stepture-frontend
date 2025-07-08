"use client";

import React, { useState } from "react";
import Image from "next/image";
import TimeIcon from "@/public/time.svg";
import StepsIcon from "@/public/steps.svg";
import PersonIcon from "@/public/person.svg";
import Logo from "@/public/AUlogo.png";

interface ScreenshotViewerProps {
  initialCaptures: CaptureData[];
  metadata: DocumentMetadata;
}

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

interface DocumentMetadata {
  title: string;
  description: string;
  author: string;
  stepsCount: number;
  estimatedTime: string;
}

export default function ScreenshotViewer({ initialCaptures, metadata }: ScreenshotViewerProps) {
  const [captures] = useState(initialCaptures);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#E3EAFC] to-white flex items-center justify-center">
          <Image src={Logo} alt="Logo" width={48} height={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{metadata.title}</h1>
          <p className="text-gray-700 mt-2">{metadata.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <Image src={PersonIcon} alt="Author" width={16} height={16} />
              {metadata.author}
            </div>
            <div className="flex items-center gap-1">
              <Image src={StepsIcon} alt="Steps" width={16} height={16} />
              {metadata.stepsCount} Steps
            </div>
            <div className="flex items-center gap-1">
              <Image src={TimeIcon} alt="Time" width={16} height={16} />
              {metadata.estimatedTime}
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="space-y-6">
        {captures.map((step, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="px-3 py-1 rounded-md font-semibold text-blue-600 bg-blue-100">
                Step-{index + 1}
              </span>
              <p className="text-gray-800">
                <strong>Click:</strong> “{step.info.textContent}”
              </p>
            </div>
            <Image
              src={step.screenshot}
              alt={`Screenshot for step ${index + 1}`}
              width={800}
              height={600}
              className="rounded-md border"
            />
          </div>
        ))}
      </div>
    </div>
  );
}