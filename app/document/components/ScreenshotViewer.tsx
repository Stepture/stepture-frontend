"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  stepCount: number;
  estimatedTime: string;
}

const ResponsiveScreenshotItem = ({
  img,
  index,
  info,
}: {
  img: string;
  index: number;
  info: ElementInfo;
}) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle image load to get original dimensions
  const handleImageLoad = useCallback(() => {
    const imgElement = imgRef.current;
    if (imgElement) {
      setImageDimensions({
        width: imgElement.naturalWidth,
        height: imgElement.naturalHeight,
      });
      setDisplayDimensions({
        width: imgElement.clientWidth,
        height: imgElement.clientHeight,
      });
    }
  }, []);

  // Update display dimensions when image resizes
  const updateDisplayDimensions = useCallback(() => {
    const imgElement = imgRef.current;
    if (imgElement) {
      setDisplayDimensions({
        width: imgElement.clientWidth,
        height: imgElement.clientHeight,
      });
    }
  }, []);

  const getResponsivePosition = useCallback(() => {
    if (
      !info?.coordinates ||
      imageDimensions.width === 0 ||
      displayDimensions.width === 0
    ) {
      return { left: "50%", top: "50%" };
    }

    const captureContext = info.captureContext;
    const coords = info.coordinates.viewport;

    if (captureContext) {
      const {
        devicePixelRatio = 1,
        viewportWidth,
        viewportHeight,
      } = captureContext;

      // Method 1: Use capture context for accurate positioning
      if (viewportWidth && viewportHeight) {
        // Calculate position as percentage of the original viewport
        const xPercent = (coords.x / viewportWidth) * 100;
        const yPercent = (coords.y / viewportHeight) * 100;

        // Debug logging for troubleshooting
        if (index === 0) {
          console.log("Enhanced Position Calculation:", {
            originalCoords: coords,
            devicePixelRatio,
            captureViewport: { width: viewportWidth, height: viewportHeight },
            screenshotDimensions: imageDimensions,
            displayDimensions,
            calculatedPercent: { x: xPercent, y: yPercent },
          });
        }

        return {
          left: `${Math.min(Math.max(xPercent, 0), 100)}%`,
          top: `${Math.min(Math.max(yPercent, 0), 100)}%`,
        };
      }
    }

    // Method 2: Fallback - Direct calculation based on screenshot dimensions
    // This assumes the coordinates are relative to the screenshot size
    const xPercent = (coords.x / imageDimensions.width) * 100;
    const yPercent = (coords.y / imageDimensions.height) * 100;

    if (index === 0) {
      console.log("Fallback Position Calculation:", {
        coords,
        imageDimensions,
        displayDimensions,
        calculatedPercent: { x: xPercent, y: yPercent },
      });
    }

    return {
      left: `${Math.min(Math.max(xPercent, 0), 100)}%`,
      top: `${Math.min(Math.max(yPercent, 0), 100)}%`,
    };
  }, [info, imageDimensions, displayDimensions, index]);

  // Get responsive indicator size based on display dimensions
  const getIndicatorSize = useCallback(() => {
    if (displayDimensions.width === 0) return 32;

    // Scale indicator based on display size
    const baseSize = 32;
    const scaleFactor = Math.min(displayDimensions.width / 400, 1.5);
    return Math.max(16, Math.min(48, baseSize * scaleFactor));
  }, [displayDimensions.width]);

  // Set up ResizeObserver to track image resize
  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updateDisplayDimensions();
    });

    resizeObserver.observe(imgElement);

    // Fallback: Listen to window resize
    const handleResize = () => updateDisplayDimensions();
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [updateDisplayDimensions]);

  // Listen for sidebar resize events
  useEffect(() => {
    const handleSidebarResize = () => {
      setTimeout(updateDisplayDimensions, 100); // Small delay to ensure layout is complete
    };

    const observer = new MutationObserver(() => {
      handleSidebarResize();
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => observer.disconnect();
  }, [updateDisplayDimensions]);

  return (
    <div
      ref={containerRef}
      className="screenshot-item border border-gray-200 rounded-lg p-4 bg-white flex flex-col items-start gap-3 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="px-3 py-1 rounded-md font-semibold text-blue-600 bg-blue-100">
          Step {index + 1}
        </span>
        <p className="text-gray-800">{info.textContent}</p>
      </div>

      <div className="relative w-full">
        <Image
          ref={imgRef}
          src={img}
          alt={`Screenshot ${index + 1}`}
          width={info?.captureContext?.viewportWidth || 800}
          height={info?.captureContext?.viewportHeight || 600}
          onLoad={handleImageLoad}
          className="w-full h-auto border rounded-md"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />

        {info?.coordinates &&
          imageDimensions.width > 0 &&
          displayDimensions.width > 0 && (
            <div
              className="absolute opacity-50 rounded-full border-4 border-blue-300 bg-blue-500 bg-opacity-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
              style={{
                ...getResponsivePosition(),
                width: `${getIndicatorSize()}px`,
                height: `${getIndicatorSize()}px`,
              }}
              aria-label={`Click indicator for step ${index + 1}`}
            >
              <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-50"></div>
            </div>
          )}
      </div>
    </div>
  );
};

export default function ScreenshotViewer({
  initialCaptures,
  metadata,
}: ScreenshotViewerProps) {
  const [captures] = useState(initialCaptures);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#E3EAFC] to-white flex items-center justify-center">
          <Image src={Logo} alt="Logo" width={48} height={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {metadata.title}
          </h1>
          <p className="text-gray-700 mt-2">{metadata.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-1">
              <Image src={PersonIcon} alt="Author" width={16} height={16} />
              {metadata.author}
            </div>
            <div className="flex items-center gap-1">
              <Image src={StepsIcon} alt="Steps" width={16} height={16} />
              {metadata.stepCount} Steps
            </div>
            <div className="flex items-center gap-1">
              <Image src={TimeIcon} alt="Time" width={16} height={16} />
              {metadata.estimatedTime}
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots Section */}
      <div className="flex flex-col gap-6 mt-12">
        {captures.map((capture, index) => (
          <ResponsiveScreenshotItem
            key={`${index}-${capture.screenshot.substring(0, 20)}`}
            img={capture.screenshot}
            index={index}
            info={capture.info}
          />
        ))}
      </div>
      {/* Footer Section */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>© {new Date().getFullYear()} Stepture. All rights reserved.</p>
      </div>
    </div>
  );
}
