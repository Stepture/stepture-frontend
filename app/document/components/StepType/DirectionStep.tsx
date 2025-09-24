import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Trash,
  ImagePlus,
  Loader,
  GripVertical,
  MousePointer,
} from "lucide-react";
import CustomAlertDialog from "@/components/ui/Common/CustomAlertDialog";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DraggableAttributes } from "@dnd-kit/core";
import { Screenshot } from "../../document.types";
import BlurAnnotator from "../BlurAnnotator"; // Import the BlurAnnotator component

interface DirectionStepProps {
  img: string;
  index: number;
  info: Screenshot | null;
  mode: string;
  stepDescription: string;
  stepNumber: number;
  stepId: string;
  onStepDescriptionChange?: (stepId: string, newDescription: string) => void;
  handleDeleteStep: (id: string) => void;
  handleAddNewImage?: (stepNumber: number) => void;
  handleDeleteImage?: (stepNumber: number) => void;
  loading?: boolean;
  dragAttributes?: unknown;
  dragListeners?: unknown;
  isDragging?: boolean;
  annotationColor?: string;
  onImageBlurred: (
    stepId: string,
    dataUrl: string,
    info: Screenshot | null
  ) => Promise<void>;
}

const DirectionStep: React.FC<DirectionStepProps> = ({
  img,
  index,
  info,
  mode,
  stepDescription,
  stepNumber,
  stepId,
  onStepDescriptionChange,
  handleDeleteStep,
  handleAddNewImage,
  handleDeleteImage,
  onImageBlurred,
  loading,
  dragAttributes,
  dragListeners,
  isDragging,
  annotationColor,
}) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showBlurAnnotator, setShowBlurAnnotator] = useState(false); // New state

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const originalDescriptionRef = useRef<string>(stepDescription);

  const determineAnnotationColor = (annotationColor: string) => {
    switch (annotationColor.toLowerCase()) {
      case "green":
        return "bg-green-500 border-green-300";
      case "blue":
        return "bg-blue-500 border-blue-300";
      case "yellow":
        return "bg-yellow-500 border-yellow-300";
      default:
        return "bg-blue-500 border-blue-300";
    }
  };

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

  const updateDisplayDimensions = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const imgElement = imgRef.current;
      if (imgElement) {
        setDisplayDimensions({
          width: imgElement.clientWidth,
          height: imgElement.clientHeight,
        });
      }
    });
  }, []);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (mode === "edit") {
      onStepDescriptionChange?.(stepId, e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mode !== "edit") return;

    if (e.key === "Escape") {
      onStepDescriptionChange?.(stepId, originalDescriptionRef.current);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  // Function to render text with "Navigate to:" links
  const renderTextWithLinks = (text: string) => {
    const navigateToRegex = /^Navigate to:\s*(.+)$/i;
    const match = text.match(navigateToRegex);

    if (match) {
      const url = match[1].trim();
      // Check if the URL starts with http:// or https://, if not, add https://
      const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

      return (
        <span>
          <span className="font-medium">Navigate to: </span>
          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
          >
            {url}
          </a>
        </span>
      );
    }

    // Check if text starts with https:// or http://
    const urlRegex = /^(https?:\/\/.+)$/i;
    const urlMatch = text.match(urlRegex);

    if (urlMatch) {
      const url = urlMatch[1].trim();

      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
        >
          {url}
        </a>
      );
    }

    return <span>{text}</span>;
  };

  // Handle blur annotation
  const handleBlurAnnotation = () => {
    if (img && mode === "edit") {
      setShowBlurAnnotator(true);
    }
  };

  const handleBlurCancel = () => {
    setShowBlurAnnotator(false);
  };

  useEffect(() => {
    originalDescriptionRef.current = stepDescription;
  }, [stepDescription]);

  const getResponsivePosition = useCallback(() => {
    if (imageDimensions.width === 0 || displayDimensions.width === 0) {
      return { left: "50%", top: "50%" };
    }

    const captureContext = {
      devicePixelRatio: info?.devicePixelRatio || 1,
      viewportWidth: info?.viewportWidth || imageDimensions.width,
      viewportHeight: info?.viewportHeight || imageDimensions.height,
    };
    const coords = {
      x: info?.viewportX || 0,
      y: info?.viewportY || 0,
    };

    if (captureContext) {
      const { viewportWidth, viewportHeight } = captureContext;

      if (viewportWidth && viewportHeight) {
        const xPercent = (coords.x / viewportWidth) * 100;
        const yPercent = (coords.y / viewportHeight) * 100;

        return {
          left: `${Math.min(Math.max(xPercent, 0), 100)}%`,
          top: `${Math.min(Math.max(yPercent, 0), 100)}%`,
        };
      }
    }

    const xPercent = (coords.x / imageDimensions.width) * 100;
    const yPercent = (coords.y / imageDimensions.height) * 100;

    return {
      left: `${Math.min(Math.max(xPercent, 0), 100)}%`,
      top: `${Math.min(Math.max(yPercent, 0), 100)}%`,
    };
  }, [info, imageDimensions, displayDimensions]);

  const getIndicatorSize = useCallback(() => {
    if (displayDimensions.width === 0) return 32;
    const baseSize = 32;
    const scaleFactor = Math.min(displayDimensions.width / 400, 1.5);
    return Math.max(16, Math.min(48, baseSize * scaleFactor));
  }, [displayDimensions.width]);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }

    resizeObserverRef.current = new ResizeObserver(() => {
      updateDisplayDimensions();
    });

    resizeObserverRef.current.observe(imgElement);

    const handleResize = () => updateDisplayDimensions();
    window.addEventListener("resize", handleResize);

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateDisplayDimensions]);

  return (
    <div>
      <div
        ref={containerRef}
        className={`screenshot-item border border-blue-200 rounded-lg p-4 bg-blue-50 flex flex-col items-start gap-3 shadow-sm transition-all duration-200 ${
          isDragging ? "shadow-lg scale-105" : ""
        }`}
      >
        <div className="flex items-start gap-2 text-sm font-medium w-full">
          {mode === "edit" ? (
            <span
              className="cursor-grab active:cursor-grabbing hover:text-blue-800"
              {...(dragAttributes as DraggableAttributes)}
              {...(dragListeners as SyntheticListenerMap)}
            >
              <GripVertical className="w-4 h-4 inline-block" />{" "}
            </span>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <div className="w-6 h-6 rounded-full font-semibold text-blue-600 bg-slate-200 p-4 flex items-center justify-center text-center">
                {index + 1}
              </div>

              <MousePointer className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <div className="flex-1 ml-4 mt-1">
            {mode === "edit" ? (
              <textarea
                ref={inputRef}
                className="rounded-md w-full h-auto resize-none break-words break-all text-base border-blue-300 bg-white px-2 cursor-text border-none focus:outline-none ring-2 ring-blue-100 focus:ring-2 focus:ring-blue-500 font-normal"
                value={stepDescription}
                onChange={handleDescriptionChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter step description..."
                rows={1}
                style={{
                  minHeight: "2.5rem",
                  wordBreak: "break-all",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  overflow: "visible",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            ) : (
              <div
                className="rounded-md w-full min-h-10 break-words break-all text-base font-medium bg-transparent cursor-default"
                style={{
                  minHeight: "2.5rem",
                  wordBreak: "break-all",
                  overflowWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  padding: "0.5rem 0",
                }}
              >
                {renderTextWithLinks(stepDescription)}
              </div>
            )}
          </div>
          {mode === "edit" && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-100 rounded-sm cursor-pointer hover:bg-red-100 transition-colors">
                <CustomAlertDialog
                  title="Delete Step"
                  description={`Are you sure you want to delete this step? `}
                  onConfirm={() => handleDeleteStep(stepId)}
                  triggerDescription={
                    <Trash
                      aria-label="Delete Step"
                      role="button"
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                    />
                  }
                />
              </div>
            </div>
          )}
        </div>

        {img ? (
          <div className="relative w-full group">
            <Image
              ref={imgRef}
              src={img}
              alt={`Screenshot ${stepNumber}`}
              width={info?.viewportWidth || 800}
              height={info?.viewportHeight || 600}
              onLoad={handleImageLoad}
              className={`w-full h-auto border rounded-md transition-all duration-200 ${
                mode === "edit"
                  ? "group-hover:brightness-80 cursor-pointer"
                  : ""
              }`}
              style={{ maxWidth: "100%", height: "auto" }}
            />

            {mode === "edit" && (
              <div className="hidden group-hover:flex absolute top-2 right-2 items-center gap-2 bg-white p-1.5 rounded-md shadow-md">
                {/* Blur button */}
                <button
                  onClick={handleBlurAnnotation}
                  className="p-1.5  bg-blue-custom rounded text-white cursor-pointer"
                  title="Blur sensitive information"
                  aria-label="Blur sensitive information from image"
                >
                  Blur sensitive information
                </button>

                {/* Delete image button */}
                <CustomAlertDialog
                  title="Delete Image"
                  description={`Are you sure you want to delete the image from this step? `}
                  onConfirm={() => handleDeleteImage?.(stepNumber)}
                  triggerDescription={
                    <div
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Delete image"
                      aria-label="Delete image from step"
                      role="button"
                    >
                      <Trash className="w-5 h-5" />
                    </div>
                  }
                />
              </div>
            )}

            {info?.viewportX !== 0 &&
              info?.viewportY !== 0 &&
              imageDimensions.width > 0 &&
              displayDimensions.width > 0 && (
                <div
                  className={`absolute opacity-50 border-4 rounded-full bg-opacity-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ${determineAnnotationColor(
                    annotationColor || "BLUE"
                  )}`}
                  style={{
                    ...getResponsivePosition(),
                    width: `${getIndicatorSize()}px`,
                    height: `${getIndicatorSize()}px`,
                  }}
                  aria-label={`Click indicator for step ${stepNumber}`}
                >
                  <div className="absolute inset-0 bg-blue-400 rounded-full opacity-50"></div>
                </div>
              )}
          </div>
        ) : (
          <>
            {mode === "edit" && (
              <div className="w-full h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                {loading ? (
                  <Loader className="w-12 h-12 text-blue-300 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImagePlus
                      className="w-12 h-12 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => {
                        handleAddNewImage?.(stepNumber);
                      }}
                    />
                    <span>Add new image to the step</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Blur Annotator Modal */}
      {showBlurAnnotator && img && (
        <BlurAnnotator
          stepId={stepId}
          imageUrl={img}
          onSave={onImageBlurred}
          onCancel={handleBlurCancel}
          isOpen={showBlurAnnotator}
          info={info}
        />
      )}
    </div>
  );
};

export default DirectionStep;
