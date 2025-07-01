"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import Image from "next/image";

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
    screenWidth?: number;
    screenHeight?: number;
  };
}

interface ScreenshotViewerProps {
  initialCaptures: CaptureData[];
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
      <div className="rounded-sm bg-background font-semibold color-blue px-2 py-1">
        <p className="text-xs text-blue">Step {index + 1}</p>
      </div>

      <div className="text-start p-2 text-base text-slate-800">
        {info && (
          <div className="space-y-1">
            <p>
              <span className="font-medium">Click:</span>{" "}
              <span className="text-slate-600">
                {info.textContent && (
                  <span className="text-slate-800">"{info.textContent}"</span>
                )}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="relative w-full">
        <Image
          width={info?.captureContext?.viewportWidth}
          height={info?.captureContext?.viewportHeight}
          ref={imgRef}
          src={img}
          alt={`Screenshot ${index + 1}`}
          onLoad={handleImageLoad}
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

const ScreenshotViewer = ({ initialCaptures }: ScreenshotViewerProps) => {
  const [captures, setCaptures] = useState<CaptureData[]>(initialCaptures);
  const [loading, setLoading] = useState(false);

  // If you need to refresh or update captures, you can add methods here
  const refreshCaptures = useCallback((newCaptures: CaptureData[]) => {
    setCaptures(newCaptures);
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!captures || captures.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No screenshots available
      </div>
    );
  }

  return (
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
  );
};

export default ScreenshotViewer;
