"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import TimeIcon from "@/public/time.svg";
import StepsIcon from "@/public/steps.svg";
import PersonIcon from "@/public/person.svg";
import Logo from "@/public/AUlogo.png";
import { Loader, Sparkles } from "lucide-react";
import CustomButton from "@/components/ui/Common/CustomButton";
import { useRouter } from "next/navigation";

import {
  Screenshot,
  CaptureResponse,
  Step,
  EditCaptureRequest,
} from "../document.types";
import { apiClient } from "@/lib/axios-client";
import { showToast } from "@/components/ui/Common/ShowToast";
import CustomAlertDialog from "@/components/ui/Common/CustomAlertDialog";

// BYOK imports
import { PasswordAuthModal } from "@/components/PasswordAuthModal";
import { RefinementPanel } from "@/components/RefinementPanel";
import { useAPIKeyManager } from "@/hooks/useAPIKeyManager";
import StepViewer from "./StepViewer";

interface DocumentDetailsListProps {
  captures: CaptureResponse;
  mode: string;
  id: string;
}

export default function DocumentDetailsList({
  captures,
  mode,
  id,
}: DocumentDetailsListProps) {
  const [capturesData, setCapturesData] = useState(captures);
  const [stepsToDelete, setStepsToDelete] = useState<string[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [documentUpdateLoading, setDocumentUpdateLoading] = useState(false);
  const router = useRouter();

  // BYOK state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRefinementPanel, setShowRefinementPanel] = useState(false);
  const [authPurpose, setAuthPurpose] = useState<"setup" | "unlock" | "change">(
    "unlock"
  );

  const keyManager = useAPIKeyManager();

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

  // Handle steps reorder
  const handleStepsReorder = useCallback((newSteps: Step[]) => {
    setCapturesData((prev) => ({
      ...prev,
      steps: newSteps,
    }));

    showToast("info", <span>Steps reordered successfully!</span>, {
      autoClose: 2000,
    });
  }, []);

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
    const steps = capturesData.steps.map((step) => {
      if (step.id && step.id.startsWith("temp-")) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = step;
        return rest;
      }
      return step;
    });

    const updateData: EditCaptureRequest = {
      title: capturesData.title,
      description: capturesData.description,
      steps: steps,
      deleteStepIds: stepsToDelete,
      annotationColor: capturesData?.annotationColor || "BLUE",
    };

    setDocumentUpdateLoading(true);

    try {
      const updatedData = await apiClient.protected.updateDocument(
        id,
        updateData
      );
      setDocumentUpdateLoading(false);

      showToast("success", <span>Document updated successfully!</span>, {
        autoClose: 2000,
      });
      router.push(`/document/${id}`);
    } catch (error) {
      console.error("Failed to update document:", error);
      setDocumentUpdateLoading(false);
      showToast("error", <span>Failed to update document</span>, {
        autoClose: 3000,
      });
    }
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

  const calculateStepNumber = (
    prevStepNumber: number,
    afterStepNumber: number
  ) => {
    // Handle edge case where afterStepNumber is 0 or not provided
    if (afterStepNumber === 0 || !afterStepNumber) {
      return prevStepNumber + 1;
    }

    const difference = afterStepNumber - prevStepNumber;

    // If the difference is too small, suggest renumbering
    if (difference < 0.01) {
      console.warn(
        "Steps are too close together, consider renumbering all steps"
      );
      return prevStepNumber + 0.001;
    }

    // Calculate the midpoint and round to avoid floating point precision issues
    const newStepNumber = (prevStepNumber + afterStepNumber) / 2;
    return Math.round(newStepNumber * 1000) / 1000; // Round to 3 decimal places
  };

  const handleAddNewStep = (selectedType: string, index: number) => {
    let newStepNumber: number;

    // if the new step is added at the end, just add 1 to the last step number
    if (index === capturesData.steps.length - 1) {
      newStepNumber = capturesData.steps.length
        ? capturesData.steps[capturesData.steps.length - 1].stepNumber + 1
        : 1;
    } else {
      // if not, calculate the new step number based on the previous and next step numbers
      newStepNumber = calculateStepNumber(
        capturesData.steps[index]?.stepNumber || 0,
        capturesData.steps[index + 1]?.stepNumber || 0
      );
    }
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    const newStep: Step = {
      id: tempId,
      stepDescription: "New step added",
      stepNumber: newStepNumber,
      type: selectedType,
      documentId: capturesData.id,
      screenshot: null,
    };
    setCapturesData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps.slice(0, index + 1),
        newStep,
        ...prev.steps.slice(index + 1),
      ],
    }));

    showToast("success", <span>New step added successfully!</span>, {
      autoClose: 2000,
    });
  };

  const handleDeleteImage = (stepNumber: number) => {
    setCapturesData((prev) => ({
      ...prev,
      steps: prev.steps.map((step) =>
        step?.stepNumber === stepNumber ? { ...step, screenshot: null } : step
      ),
    }));
    showToast("info", <span>Image deleted successfully!</span>, {
      autoClose: 2000,
    });
  };

  const handleAddNewImage = async (stepNumber: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    // Handle file selection
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setImageUploadLoading(true);
        const response = await apiClient.protected.uploadImageToGoogleApi(file);
        setImageUploadLoading(false);
        if (response) {
          const newScreenshot: Screenshot = {
            googleImageId: response.imgId,
            url: response.publicUrl,
            viewportX: 0,
            viewportY: 0,
            viewportHeight: 0,
            viewportWidth: 0,
            devicePixelRatio: window.devicePixelRatio,
          };

          setCapturesData((prev) => ({
            ...prev,
            steps: prev.steps.map((step) =>
              step?.stepNumber === stepNumber
                ? {
                    ...step,
                    screenshot: newScreenshot,
                  }
                : step
            ),
          }));
        }

        showToast("success", <span>Image added successfully!</span>, {
          autoClose: 2000,
        });
      } catch (error) {
        console.error("Failed to upload image:", error);
        showToast("error", <span>Failed to add image</span>, {
          autoClose: 2000,
        });
      }
    };

    input.click();
  };

  const addNewBlurredImage = async (
    stepId: string,
    dataUrl: string,
    info: Screenshot | null
  ) => {
    try {
      setImageUploadLoading(true);

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Convert blob to file for upload
      const file = new File([blob], `blurred-step-${stepId}.png`, {
        type: "image/png",
      });

      const uploadResponse = await apiClient.protected.uploadImageToGoogleApi(
        file
      );
      setImageUploadLoading(false);

      if (uploadResponse) {
        const newScreenshot: Screenshot = {
          googleImageId: uploadResponse.imgId,
          url: uploadResponse.publicUrl,
          viewportX: info?.viewportX || 0,
          viewportY: info?.viewportY || 0,
          viewportHeight: info?.viewportHeight || 0,
          viewportWidth: info?.viewportWidth || 0,
          devicePixelRatio: window.devicePixelRatio,
        };

        setCapturesData((prev) => ({
          ...prev,
          steps: prev.steps.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  screenshot: newScreenshot,
                }
              : step
          ),
        }));

        showToast(
          "success",
          <span>Image blurred and updated successfully!</span>,
          {
            autoClose: 2000,
          }
        );
      }
    } catch (error) {
      console.error("Failed to upload blurred image:", error);
      setImageUploadLoading(false);
      showToast("error", <span>Failed to update blurred image</span>, {
        autoClose: 2000,
      });
    }
  };

  // BYOK handlers
  const handleRefineSteps = async () => {
    const hasStoredKey = await keyManager.hasStoredKey();

    if (!hasStoredKey) {
      // User doesn't have a key, ask to set up
      setAuthPurpose("setup");
      setShowAuthModal(true);
      return;
    }

    if (!keyManager.isSessionValid()) {
      // User has key but session expired, ask for password
      setAuthPurpose("unlock");
      setShowAuthModal(true);
      return;
    }

    // User has valid session, show refinement panel
    setShowRefinementPanel(true);
  };

  const handleAuthSuccess = async (
    password: string,
    apiKey?: string
  ): Promise<boolean> => {
    try {
      if (authPurpose === "setup") {
        if (!apiKey) {
          return false;
        }
        // Store the API key with the password
        await keyManager.storeAPIKey(apiKey, password);
        setShowAuthModal(false);
        setShowRefinementPanel(true);
        return true;
      } else if (authPurpose === "change") {
        if (!apiKey) {
          return false;
        }
        // Delete the old key and store the new one
        await keyManager.deleteApiKey();
        await keyManager.storeAPIKey(apiKey, password);
        setShowAuthModal(false);
        setShowRefinementPanel(true);
        return true;
      } else {
        // For unlock, just authenticate with existing key
        const success = await keyManager.authenticateSession(password);
        if (success) {
          setShowAuthModal(false);
          setShowRefinementPanel(true);
        }
        return success;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      return false;
    }
  };

  const handleStepsRefined = (refinedSteps: string[]) => {
    // Update the steps in the document
    setCapturesData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, index) => ({
        ...step,
        stepDescription: refinedSteps[index] || step.stepDescription,
      })),
    }));

    showToast("success", <span>Steps refined successfully!</span>, {
      autoClose: 3000,
    });
  };

  const handleRefineBulkSteps = async () => {
    const stepDescriptions = capturesData.steps.map(
      (step) => step.stepDescription || ""
    );
    const refinedSteps = await keyManager.refineSteps(
      stepDescriptions,
      "clarity"
    );
    handleStepsRefined(refinedSteps);
    setShowRefinementPanel(false);
  };

  const handleChangeApiKey = () => {
    setAuthPurpose("change");
    setShowAuthModal(true);
  };

  const handleRefineDocumentDescription = async () => {
    const hasStoredKey = await keyManager.hasStoredKey();

    if (!hasStoredKey) {
      setAuthPurpose("setup");
      setShowAuthModal(true);
      return;
    }

    if (!keyManager.isSessionValid()) {
      setAuthPurpose("unlock");
      setShowAuthModal(true);
      return;
    }

    // Refine the document description with full context
    if (capturesData.description) {
      try {
        const documentText = `Title: ${capturesData.title}\nDescription: ${
          capturesData.description
        }\n\nSteps:\n${capturesData.steps
          .map((step, idx) => `${idx + 1}. ${step.stepDescription}`)
          .join("\n")}`;

        const refinedDescription = await keyManager.refineDocumentDescription(
          capturesData.description,
          documentText
        );

        setCapturesData((prev) => ({
          ...prev,
          description: refinedDescription,
        }));

        showToast(
          "success",
          <span>Document description refined successfully!</span>,
          {
            autoClose: 2000,
          }
        );
      } catch {
        showToast("error", <span>Failed to refine document description</span>, {
          autoClose: 2000,
        });
      }
    }
  };

  const handleAnnotationColorChange = (color: string) => {
    setCapturesData((prev) => ({
      ...prev,
      annotationColor: color.toUpperCase(),
    }));
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6 relative"
    >
      {documentUpdateLoading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-200 backdrop-blur-md z-50">
          <div className="absolute inset-0 bg-gray-900/10"></div>
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <Loader className="w-12 h-12 text-blue-300 animate-spin" />
            <div className="text-center">
              <p className="text-gray-700 font-medium">Updating document...</p>
              <p className="text-gray-500 text-sm mt-1">
                Please wait for a moment
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {mode === "edit" && (
            <div
              ref={headerRef}
              className="sticky top-2 left-0 z-50 w-full flex items-center justify-between p-4 bg-blue-100 backdrop-blur-sm border-b border-gray-100 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={scrollToTop}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  ↑ Scroll to top
                </button>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleAnnotationColorChange("blue")}
                      className={`w-6 h-6 rounded-full bg-blue-500 border-2 transition-all ${
                        capturesData.annotationColor?.toLowerCase() === "blue"
                          ? "border-blue-700 ring-2 ring-blue-500"
                          : "border-blue-300 hover:border-blue-600"
                      }`}
                      title="Blue"
                    />
                    <button
                      onClick={() => handleAnnotationColorChange("green")}
                      className={`w-6 h-6 rounded-full bg-green-500 border-2 transition-all ${
                        capturesData.annotationColor?.toLowerCase() === "green"
                          ? "border-green-700 ring-2 ring-green-500"
                          : "border-green-300 hover:border-green-600"
                      }`}
                      title="Green"
                    />
                    <button
                      onClick={() => handleAnnotationColorChange("yellow")}
                      className={`w-6 h-6 rounded-full bg-yellow-500 border-2 transition-all ${
                        capturesData.annotationColor?.toLowerCase() === "yellow"
                          ? "border-yellow-700 ring-2 ring-yellow-500"
                          : "border-yellow-300 hover:border-yellow-600"
                      }`}
                      title="Yellow"
                    />
                  </div>
                </div>
              </div>

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

          {mode === "edit" && (
            <div className="flex justify-end mb-4 gap-2">
              <CustomButton
                label="Change API Key"
                variant="default"
                size="small"
                onClick={handleChangeApiKey}
              />
              <CustomButton
                label="Refine with AI"
                variant="secondary"
                size="small"
                onClick={handleRefineSteps}
              />
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
                value={capturesData?.title || ""}
                readOnly={mode !== "edit"}
                disabled={mode !== "edit"}
                onChange={handleTitleChange}
                onKeyDown={handleTitleKeyDown}
                placeholder={mode === "edit" ? "Enter document title..." : ""}
              />

              <div className="flex items-center gap-2">
                <input
                  ref={descriptionInputRef}
                  className={`text-gray-700 mt-2 break-words w-full ${
                    mode === "edit"
                      ? "bg-transparent border-none outline-none ring-2 ring-blue-200 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 mx-2"
                      : "bg-transparent border-none cursor-default"
                  }`}
                  type="text"
                  value={capturesData?.description || ""}
                  readOnly={mode !== "edit"}
                  disabled={mode !== "edit"}
                  onChange={handleDocumentDescriptionChange}
                  onKeyDown={handleDocumentDescriptionKeyDown}
                  placeholder={mode === "edit" ? "Enter document title..." : ""}
                />
                {mode === "edit" && keyManager.isSessionValid() && (
                  <button
                    onClick={handleRefineDocumentDescription}
                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="Refine document description with AI"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
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
                    {capturesData?.estimatedCompletionTime
                      ? (() => {
                          const mins = Math.ceil(
                            capturesData.estimatedCompletionTime / 60
                          );
                          return `~${mins} min${mins !== 1 ? "s" : ""} read`;
                        })()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Screenshots Section using StepViewer */}
          <div className="flex flex-col gap-6 mt-12">
            <StepViewer
              steps={capturesData?.steps || []}
              mode={mode}
              onStepDescriptionChange={handleStepDescriptionChange}
              onDeleteStep={handleDeleteStep}
              onAddNewImage={handleAddNewImage}
              onDeleteImage={handleDeleteImage}
              onStepsReorder={handleStepsReorder}
              onAddNewStep={handleAddNewStep}
              loading={imageUploadLoading}
              annotationColor={capturesData?.annotationColor || "BLUE"}
              onImageBlurred={addNewBlurredImage}
            />
          </div>

          {/* Footer Section */}
          <footer className="text-center text-gray-500 text-sm mt-8 pt-8 border-t border-gray-100">
            <p>© {new Date().getFullYear()} Stepture. All rights reserved.</p>
          </footer>
        </>
      )}

      {/* BYOK Modals */}
      <PasswordAuthModal
        isOpen={showAuthModal}
        onAuthenticate={handleAuthSuccess}
        onClose={() => setShowAuthModal(false)}
        purpose={authPurpose}
      />

      <RefinementPanel
        isOpen={showRefinementPanel}
        onClose={() => setShowRefinementPanel(false)}
        onRefineSteps={handleRefineBulkSteps}
        steps={capturesData.steps.map((step) => step.stepDescription || "")}
      />
    </div>
  );
}
