"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import Image from "next/image"; // Use next/image for optimized images

type Props = {};

interface CaptureData {
  tab: any; // or specify the type if you use it
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

  // Calculate responsive position based on current container width
  // Updated getResponsivePosition function with proper coordinate handling
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

const page = (props: Props) => {
  const captures = [
    {
      info: {
        captureContext: {
          devicePixelRatio: 1,
          screenHeight: 1080,
          screenWidth: 1920,
          viewportHeight: 958,
          viewportWidth: 1526,
        },
        className: "h2 lh-condensed",
        coordinates: {
          viewport: {
            x: 285,
            y: 146,
          },
        },
        href: "None",
        id: "None",
        placeholder: "None",
        tagName: "H1",
        textContent: "Stepture",
        timestamp: "2025-06-26T18:12:06.880Z",
        type: "None",
        url: "https://github.com/Stepture",
        value: "None",
      },
      screenshot:
        "https://drive.google.com/uc?id=13x9q_W6mkLRJAYXOhoqOjcbYIG1zCqWl",
      tab: null,
    },
    {
      info: {
        captureContext: {
          devicePixelRatio: 1,
          screenHeight: 1080,
          screenWidth: 1920,
          viewportHeight: 958,
          viewportWidth: 1526,
        },
        className: "h1 lh-condensed mb-2",
        coordinates: {
          viewport: {
            x: 385,
            y: 323,
          },
        },
        href: "None",
        id: "None",
        placeholder: "None",
        tagName: "H2",
        textContent: "We think you’re gonna like it here.",
        timestamp: "2025-06-26T18:12:08.134Z",
        type: "None",
        url: "https://github.com/Stepture",
        value: "None",
      },
      screenshot:
        "https://drive.google.com/uc?id=1RMvezum_icylyKcsVceZGQkP_QpzYHXz",
      tab: null,
    },
    {
      info: {
        captureContext: {
          devicePixelRatio: 1,
          screenHeight: 1080,
          screenWidth: 1920,
          viewportHeight: 958,
          viewportWidth: 1526,
        },
        className: "h1 lh-condensed mb-2",
        coordinates: {
          viewport: {
            x: 418,
            y: 327,
          },
        },
        href: "None",
        id: "None",
        placeholder: "None",
        tagName: "H2",
        textContent: "We think you’re gonna like it here.",
        timestamp: "2025-06-26T18:12:13.342Z",
        type: "None",
        url: "https://github.com/Stepture",
        value: "None",
      },
      screenshot:
        "https://drive.google.com/uc?id=1hi5d2jj_HWyNodEgjX0ANyWMMooLfRA7",
      tab: null,
    },
    {
      info: {
        captureContext: {
          devicePixelRatio: 1,
          screenHeight: 1080,
          screenWidth: 1920,
          viewportHeight: 958,
          viewportWidth: 1526,
        },
        className: "None",
        coordinates: {
          viewport: {
            x: 545,
            y: 86,
          },
        },
        href: "None",
        id: "None",
        placeholder: "None",
        tagName: "SPAN",
        textContent: "Teams",
        timestamp: "2025-06-26T18:12:17.827Z",
        type: "None",
        url: "https://github.com/Stepture",
        value: "None",
      },
      screenshot:
        "https://drive.google.com/uc?id=105XnBaTo6tTMZhxenD_bTkpizXeR3gz0",
      tab: null,
    },
    {
      tab: null,
      screenshot:
        "https://drive.google.com/uc?id=1kJlt5y59Lq80DIkqf7SJtV7xEjYJbQcq",
      info: {
        tagName: "svg",
        id: "None",
        className: {},
        textContent: "",
        href: "None",
        type: "None",
        value: "None",
        placeholder: "None",
        timestamp: "2025-06-26T18:45:03.711Z",
        url: "https://www.bhonepyaekyaw.me/",
        coordinates: {
          viewport: {
            x: 667,
            y: 727,
          },
        },
        captureContext: {
          devicePixelRatio: 1,
          viewportWidth: 1526,
          viewportHeight: 958,
          screenWidth: 1920,
          screenHeight: 1080,
        },
      },
    },
    {
      tab: null,
      screenshot:
        "https://drive.google.com/uc?id=13Ea8BudYcYdwRtFuAcknOgbVMORV12r2",
      info: {
        tagName: "P",
        id: "None",
        className: "opacity-0 animate-fade-in-text animation-delay-900 text-lg",
        textContent: "Reach out to me at",
        href: "None",
        type: "None",
        value: "None",
        placeholder: "None",
        timestamp: "2025-06-26T18:45:07.965Z",
        url: "https://www.bhonepyaekyaw.me/",
        coordinates: {
          viewport: {
            x: 797,
            y: 542,
          },
        },
        captureContext: {
          devicePixelRatio: 1,
          viewportWidth: 1526,
          viewportHeight: 958,
          screenWidth: 1920,
          screenHeight: 1080,
        },
      },
    },
    {
      tab: null,
      screenshot:
        "https://drive.google.com/uc?id=1g0swDUudHvufUkEoKgOuaICMhmww57XF",
      info: {
        tagName: "svg",
        id: "None",
        className: {},
        textContent: "",
        href: "None",
        type: "None",
        value: "None",
        placeholder: "None",
        timestamp: "2025-06-26T18:45:16.786Z",
        url: "https://www.bhonepyaekyaw.me/",
        coordinates: {
          viewport: {
            x: 999,
            y: 808,
          },
        },
        captureContext: {
          devicePixelRatio: 1,
          viewportWidth: 1526,
          viewportHeight: 958,
          screenWidth: 1920,
          screenHeight: 1080,
        },
      },
    },
    {
      tab: null,
      screenshot:
        "https://drive.google.com/uc?id=1ORORJXPNdSiTD-9Oil0-PWfqfeyy9iXw",
      info: {
        tagName: "H2",
        id: "None",
        className: "f5 mb-1",
        textContent: "Feed",
        href: "None",
        type: "None",
        value: "None",
        placeholder: "None",
        timestamp: "2025-06-26T18:45:29.260Z",
        url: "https://github.com/",
        coordinates: {
          viewport: {
            x: 391,
            y: 382,
          },
        },
        captureContext: {
          devicePixelRatio: 2,
          viewportWidth: 1440,
          viewportHeight: 778,
          screenWidth: 1440,
          screenHeight: 900,
        },
      },
    },
    {
      tab: null,
      screenshot:
        "https://drive.google.com/uc?id=1S4MQvCxA3IymaAyJiieC7juifFBsbWCy",
      info: {
        tagName: "IMG",
        id: "None",
        className: "avatar circle",
        textContent: "",
        href: "None",
        type: "None",
        value: "None",
        placeholder: "None",
        timestamp: "2025-06-26T18:45:37.698Z",
        url: "https://github.com/",
        coordinates: {
          viewport: {
            x: 1392,
            y: 35,
          },
        },
        captureContext: {
          devicePixelRatio: 2,
          viewportWidth: 1440,
          viewportHeight: 778,
          screenWidth: 1440,
          screenHeight: 900,
        },
      },
    },
  ];
  return (
    <div className="w-full max-w-[800px] mx-auto p-4 flex flex-col gap-4 items-center justify-center">
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

export default page;
