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
  const [containerWidth, setContainerWidth] = useState(0);
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
    }
  }, []);

  const getResponsivePosition = useCallback(() => {
    if (
      !info?.coordinates ||
      imageDimensions.width === 0 ||
      containerWidth === 0
    ) {
      return { left: "50%", top: "50%" };
    }

    // Get the capture context if available
    const captureContext = info.captureContext;

    // Method 1: Use capture context for accurate positioning
    if (captureContext) {
      const {
        devicePixelRatio = 1,
        viewportWidth,
        viewportHeight,
      } = captureContext;

      // Screenshots are typically captured at actual device pixels
      // So we need to account for device pixel ratio
      const actualScreenshotWidth = imageDimensions.width;
      const actualScreenshotHeight = imageDimensions.height;

      // The viewport coordinates from the content script are in CSS pixels
      // Convert to percentage of the actual screenshot
      let xPercent, yPercent;

      if (viewportWidth && viewportHeight) {
        // Method A: Use viewport dimensions from capture context
        // Account for device pixel ratio scaling
        // const scaledViewportWidth = viewportWidth * devicePixelRatio;
        // const scaledViewportHeight = viewportHeight * devicePixelRatio;

        // Calculate position as percentage
        xPercent =
          ((info.coordinates.viewport.x * devicePixelRatio) /
            actualScreenshotWidth) *
          100;
        yPercent =
          ((info.coordinates.viewport.y * devicePixelRatio) /
            actualScreenshotHeight) *
          100;
      } else {
        // Method B: Fallback - assume screenshot dimensions match viewport
        xPercent =
          ((info.coordinates.viewport.x * devicePixelRatio) /
            actualScreenshotWidth) *
          100;
        yPercent =
          ((info.coordinates.viewport.y * devicePixelRatio) /
            actualScreenshotHeight) *
          100;
      }

      // Debug logging for the first item only
      if (index === 0) {
        console.log("Enhanced Position Calculation:", {
          originalCoords: info.coordinates.viewport,
          devicePixelRatio,
          captureViewport: { width: viewportWidth, height: viewportHeight },
          screenshotDimensions: {
            width: actualScreenshotWidth,
            height: actualScreenshotHeight,
          },
          calculatedPercent: { x: xPercent, y: yPercent },
          scaledCoords: {
            x: info.coordinates.viewport.x * devicePixelRatio,
            y: info.coordinates.viewport.y * devicePixelRatio,
          },
        });
      }

      return {
        left: `${Math.min(Math.max(xPercent, 0), 100)}%`,
        top: `${Math.min(Math.max(yPercent, 0), 100)}%`,
      };
    }

    // Method 2: Fallback - Direct percentage calculation (original method)
    // This assumes the screenshot dimensions directly correspond to viewport
    const originalScreenshotWidth = imageDimensions.width;
    const originalScreenshotHeight = imageDimensions.height;

    const xPercent =
      (info.coordinates.viewport.x / originalScreenshotWidth) * 100;
    const yPercent =
      (info.coordinates.viewport.y / originalScreenshotHeight) * 100;

    // Debug logging
    if (index === 0) {
      console.log("Fallback Position Calculation:", {
        originalImageSize: {
          width: originalScreenshotWidth,
          height: originalScreenshotHeight,
        },
        viewportCoords: info.coordinates.viewport,
        calculatedPercent: { x: xPercent, y: yPercent },
      });
    }

    return {
      left: `${Math.min(Math.max(xPercent, 0), 100)}%`,
      top: `${Math.min(Math.max(yPercent, 0), 100)}%`,
    };
  }, [info, imageDimensions, containerWidth, index]);

  // Get responsive indicator size
  const getIndicatorSize = useCallback(() => {
    if (containerWidth === 0) return 32;

    // Scale indicator based on container width
    const baseSize = 32;
    const scaleFactor = Math.min(containerWidth / 400, 1.5); // Max 1.5x scaling
    return Math.max(16, Math.min(48, baseSize * scaleFactor));
  }, [containerWidth]);

  // Set up ResizeObserver to track container width changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerWidth = () => {
      setContainerWidth(container.clientWidth);
    };

    // Initial measurement
    updateContainerWidth();

    // Use ResizeObserver for efficient resize detection
    const resizeObserver = new ResizeObserver(() => {
      updateContainerWidth();
    });

    resizeObserver.observe(container);

    // Fallback: Listen to window resize (for older browsers)
    const handleResize = () => updateContainerWidth();
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Also listen for extension sidebar resize events
  useEffect(() => {
    const handleSidebarResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    // Chrome extension specific resize detection
    const observer = new MutationObserver(() => {
      handleSidebarResize();
    });

    if (containerRef.current && document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="screenshot-item border-1 border-corner rounded-md p-2.5 bg-white flex flex-col items-start gap-1"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="px-3 py-1 rounded-md font-semibold text-blue-600 bg-blue-100">
          Step-{index + 1}
        </span>
        <p className="text-gray-800">{info.textContent}</p>
      </div>

      <div className="relative w-full">
        <Image
          width={info?.captureContext?.viewportWidth}
          height={info?.captureContext?.viewportHeight}
          ref={imgRef}
          src={img}
          alt={`Screenshot ${index + 1}`}
          onLoad={handleImageLoad}
          className="border rounded-md mt-2"
        />

        {info?.coordinates &&
          imageDimensions.width > 0 &&
          containerWidth > 0 && (
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
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#E3EAFC] to-white flex items-center justify-center">
          <Image src={Logo} alt="Logo" width={48} height={48} />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {metadata.title}
          </h1>
          <p className="text-gray-700 mt-2">{metadata.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
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

      <div className="flex flex-col gap-4 items-center justify-center">
        {captures.map((capture, index) => (
          <div key={`${index}-${capture.screenshot.substring(0, 20)}`}>
            <ResponsiveScreenshotItem
              img={capture.screenshot}
              index={index}
              info={capture.info}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
