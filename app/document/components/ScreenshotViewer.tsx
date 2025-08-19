"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import TimeIcon from "@/public/time.svg";
import StepsIcon from "@/public/steps.svg";
import PersonIcon from "@/public/person.svg";
import Logo from "@/public/AUlogo.png";
import { Plus, Trash, X, GripVertical } from "lucide-react";
import CustomButton from "@/components/ui/Common/CustomButton";
import { useRouter } from "next/navigation";

import {
  Screenshot,
  CaptureResponse,
  Step,
  EditCaptureRequest,
} from "../document.types";
import { apiClient } from "@/lib/axios-client";
import ChooseStepType from "./ChooseStepType";
import { showToast } from "@/components/ui/Common/ShowToast";
import CustomAlertDialog from "@/components/ui/Common/CustomAlertDialog";

interface ScreenshotViewerProps {
  captures: CaptureResponse;
  mode: string;
  id: string;
}

const ResponsiveScreenshotItem = ({
  img,
  index,
  info,
  mode,
  stepDescription,
  stepNumber,
  stepId,
  onStepDescriptionChange,
  handleDeleteStep,
}: {
  img: string;
  index: number;
  info: Screenshot | null;
  mode: string;
  stepDescription: string;
  stepNumber: number;
  stepType: string;
  stepId: string;
  onStepDescriptionChange?: (stepId: string, newDescription: string) => void;
  handleDeleteStep: (id: string) => void;
}) => {
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [displayDimensions, setDisplayDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Enhanced useRef usage
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Store the original description for cancel functionality
  const originalDescriptionRef = useRef<string>(stepDescription);

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

  // Optimized display dimensions update with RAF
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

  // Handle input changes with proper state management
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "edit") {
      onStepDescriptionChange?.(stepId, e.target.value);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mode !== "edit") return;

    if (e.key === "Escape") {
      // Reset to original description
      onStepDescriptionChange?.(stepId, originalDescriptionRef.current);
      inputRef.current?.blur();
    } else if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  };

  // Update original description ref when stepDescription prop changes
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

  // Enhanced ResizeObserver setup
  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Clean up existing observer
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

  // Enhanced MutationObserver for sidebar changes
  useEffect(() => {
    const handleSidebarResize = () => {
      setTimeout(updateDisplayDimensions, 100);
    };

    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
    }

    mutationObserverRef.current = new MutationObserver(() => {
      handleSidebarResize();
    });

    if (document.body) {
      mutationObserverRef.current.observe(document.body, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
      }
    };
  }, [updateDisplayDimensions]);

  return (
    <div
      ref={containerRef}
      className="screenshot-item border border-gray-200 rounded-lg p-4 bg-white flex flex-col items-start gap-3 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm font-medium w-full">
        {mode === "edit" ? (
          <span className="cursor-pointer hover:text-blue-800">
            <GripVertical className="w-4 h-4 inline-block" />
          </span>
        ) : (
          <span className="px-3 py-1 rounded-md font-semibold text-blue-600 bg-blue-100 min-w-24 text-center">
            step {index + 1}
          </span>
        )}
        <div className="flex-1">
          <input
            ref={inputRef}
            className={`rounded-md w-full ${
              mode === "edit"
                ? "border-blue-300 bg-white p-2 cursor-text border-none focus:outline-none ring-2 ring-blue-100 focus:ring-2 focus:ring-blue-500"
                : "font-semibold bg-transparent border-none cursor-default"
            }`}
            type="text"
            value={stepDescription}
            readOnly={mode !== "edit"}
            disabled={mode !== "edit"}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === "edit" ? "Enter step description..." : ""}
          />
        </div>
        {mode === "edit" && (
          <div className="p-2 bg-slate-100 rounded-sm cursor-pointer hover:bg-red-100 transition-colors">
            <CustomAlertDialog
              title="Delete Step"
              description={`Are you sure you want to delete step this step? `}
              onConfirm={() => handleDeleteStep(stepId)}
              triggerDescription={<Trash className="w-4 h-4 text-red-600" />}
            />
          </div>
        )}
      </div>

      {img && (
        <div className="relative w-full">
          <Image
            ref={imgRef}
            src={img}
            alt={`Screenshot ${stepNumber}`}
            width={info?.viewportWidth || 800}
            height={info?.viewportHeight || 600}
            onLoad={handleImageLoad}
            className="w-full h-auto border rounded-md"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />

          {info?.viewportX &&
            info?.viewportY &&
            imageDimensions.width > 0 &&
            displayDimensions.width > 0 && (
              <div
                className="absolute opacity-50 rounded-full border-4 border-blue-300 bg-blue-500 bg-opacity-30 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
                style={{
                  ...getResponsivePosition(),
                  width: `${getIndicatorSize()}px`,
                  height: `${getIndicatorSize()}px`,
                }}
                aria-label={`Click indicator for step ${stepNumber}`}
              >
                <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-50"></div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default function ScreenshotViewer({
  captures,
  mode,
  id,
}: ScreenshotViewerProps) {
  const [capturesData, setCapturesData] = useState(captures);
  const [stepsToDelete, setStepsToDelete] = useState<string[]>([]);
  const router = useRouter();

  const originalTitleRef = useRef<string>(captures.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const originalDescriptionRef = useRef<string>(captures.description);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const originalStepsRef = useRef<Step[]>(captures.steps);

  // Handle title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "edit") {
      setCapturesData((prev) => ({
        ...prev,
        title: e.target.value,
      }));
    }
  };

  const handleDocumentDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (mode === "edit") {
      setCapturesData((prev) => ({
        ...prev,
        description: e.target.value,
      }));
    }
  };

  // Handle step description changes
  const handleStepDescriptionChange = useCallback(
    (stepId: string, newDescription: string) => {
      setCapturesData((prev) => ({
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === stepId
            ? { ...step, stepDescription: newDescription }
            : step
        ),
      }));
    },
    []
  );

  // Handle keyboard shortcuts for title
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setCapturesData((prev) => ({
        ...prev,
        title: originalTitleRef.current,
      }));
      titleInputRef.current?.blur();
    } else if (e.key === "Enter") {
      titleInputRef.current?.blur();
    }
  };

  const handleDocumentDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Escape") {
      setCapturesData((prev) => ({
        ...prev,
        description: originalDescriptionRef.current,
      }));
      descriptionInputRef.current?.blur();
    } else if (e.key === "Enter") {
      descriptionInputRef.current?.blur();
    }
  };

  // Handle edit submission
  const handleEditSubmit = async () => {
    const updateDate: EditCaptureRequest = {
      title: capturesData.title,
      description: capturesData.description,
      steps: capturesData.steps,
      deleteStepIds: stepsToDelete,
    };

    const updatedData = await apiClient.protected.updateDocument(
      id,
      updateDate
    );

    console.log("Updated document:", updatedData);
    showToast("success", <span>Document updated successfully!</span>, {
      autoClose: 2000,
    });
    router.push(`/document/${id}`);
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setCapturesData({
      ...captures,
      title: originalTitleRef.current,
      steps: originalStepsRef.current,
    });
    router.push(`/document/${id}`);
  };

  // Scroll to top function
  const scrollToTop = () => {
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDeleteStep = (stepId: string) => {
    setCapturesData((prev) => ({
      ...prev,
      steps: prev.steps.filter((step) => step.id !== stepId),
    }));

    setStepsToDelete((prev) => [...prev, stepId]);
    showToast("info", <span>Step deleted successfully!</span>, {
      autoClose: 2000,
    });
  };

  const [showStepTypeModelAt, setShowStepTypeModelAt] = useState<number | null>(
    null
  );

  const handleShowStepTypeModel = (stepIndex: number) => {
    setShowStepTypeModelAt(
      showStepTypeModelAt === stepIndex ? null : stepIndex
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 relative"
    >
      {/* Enhanced Header Section */}
      {mode === "edit" && (
        <div
          ref={headerRef}
          className="sticky top-2 left-0 z-50 w-full flex items-center justify-between p-4 bg-blue-100 backdrop-blur-sm border-b border-gray-100 rounded-lg"
        >
          <button
            onClick={scrollToTop}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            ↑ Scroll to top
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <CustomAlertDialog
              title="Confirm Save"
              description="Are you sure you want to save changes?"
              onConfirm={handleEditSubmit}
              triggerDescription={
                <CustomButton
                  label="Save Changes"
                  variant="primary"
                  size="small"
                />
              }
            />
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-b from-[#E3EAFC] to-white flex items-center justify-center flex-shrink-0">
          <Image src={Logo} alt="Logo" width={48} height={48} />
        </div>
        <div className="flex-1 min-w-0">
          <input
            ref={titleInputRef}
            className={`text-2xl font-semibold text-gray-900 w-full ${
              mode === "edit"
                ? "bg-transparent border-none outline-none ring-2 ring-blue-200 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 mx-2"
                : ""
            }`}
            type="text"
            value={capturesData?.title || "Untitled Document"}
            readOnly={mode !== "edit"}
            disabled={mode !== "edit"}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder={mode === "edit" ? "Enter document title..." : ""}
          />

          <input
            ref={descriptionInputRef}
            className={`text-gray-700 mt-2 break-words w-full ${
              mode === "edit"
                ? "bg-transparent border-none outline-none ring-2 ring-blue-200 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 mx-2"
                : "bg-transparent border-none cursor-default"
            }`}
            type="text"
            value={capturesData?.description || "Untitled Document"}
            readOnly={mode !== "edit"}
            disabled={mode !== "edit"}
            onChange={handleDocumentDescriptionChange}
            onKeyDown={handleDocumentDescriptionKeyDown}
            placeholder={mode === "edit" ? "Enter document title..." : ""}
          />
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-1">
              <Image src={PersonIcon} alt="Author" width={16} height={16} />
              <span>{capturesData?.user?.name || "Unknown Author"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src={StepsIcon} alt="Steps" width={16} height={16} />
              <span>{capturesData?.steps?.length || 0} Steps</span>
            </div>
            <div className="flex items-center gap-1">
              <Image src={TimeIcon} alt="Time" width={16} height={16} />
              <span>
                {capturesData?.steps?.length
                  ? `~${Math.ceil(capturesData.steps.length * 0.5)} min read`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshots Section */}
      <div className="flex flex-col gap-6 mt-12">
        {capturesData?.steps.map((capture, index) => (
          <div key={capture.id} className="relative">
            <ResponsiveScreenshotItem
              img={capture.screenshot?.url || ""}
              index={index}
              info={capture.screenshot}
              mode={mode}
              stepDescription={capture.stepDescription || ""}
              stepNumber={capture.stepNumber || 0}
              stepType={capture.type || ""}
              stepId={capture.id || ""}
              onStepDescriptionChange={handleStepDescriptionChange}
              handleDeleteStep={handleDeleteStep}
            />
            {mode === "edit" && index <= capturesData.steps.length - 1 && (
              <>
                <span></span>
                <div className="relative flex items-center justify-center my-8">
                  <div className="w-full border-t border-dotted border-gray-200 absolute top-1/2 left-0 z-0" />
                  <div className="relative z-10 flex justify-center w-full">
                    <div
                      className="bg-white border border-gray-200 shadow-sm rounded-full w-10 h-10 flex items-center justify-center mx-auto transition-colors hover:bg-blue-100 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Add new step"
                    >
                      {showStepTypeModelAt === index ? (
                        <X
                          size={20}
                          className={`text-gray-400 ${
                            showStepTypeModelAt === index ? "block" : "hidden"
                          }`}
                          onClick={() => handleShowStepTypeModel(index)}
                        />
                      ) : (
                        <Plus
                          size={20}
                          className="text-gray-400"
                          onClick={() => handleShowStepTypeModel(index)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  {showStepTypeModelAt === index && (
                    <ChooseStepType
                      onStepTypeSelect={() => {
                        setShowStepTypeModelAt(null);
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {capturesData?.steps.length === 0 && (
          <>
            {mode === "edit" && (
              <>
                <span></span>
                <div className="relative flex items-center justify-center my-8">
                  <div className="w-full border-t border-dotted border-gray-200 absolute top-1/2 left-0 z-0" />
                  <div className="relative z-10 flex justify-center w-full">
                    <div
                      className="bg-white border border-gray-200 shadow-sm rounded-full w-10 h-10 flex items-center justify-center mx-auto transition-colors hover:bg-blue-100 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Add new step"
                    >
                      {showStepTypeModelAt === 0 ? (
                        <X
                          size={20}
                          className={`text-gray-400 ${
                            showStepTypeModelAt === 0 ? "block" : "hidden"
                          }`}
                          onClick={() => handleShowStepTypeModel(0)}
                        />
                      ) : (
                        <Plus
                          size={20}
                          className="text-gray-400"
                          onClick={() => handleShowStepTypeModel(0)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  {showStepTypeModelAt === 0 && (
                    <ChooseStepType
                      onStepTypeSelect={() => {
                        setShowStepTypeModelAt(null);
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Footer Section */}
      <footer className="text-center text-gray-500 text-sm mt-8 pt-8 border-t border-gray-100">
        <p>© {new Date().getFullYear()} Stepture. All rights reserved.</p>
      </footer>
    </div>
  );
}
