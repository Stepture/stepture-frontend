// components/RefinementPanel.tsx
"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "./ui/alert-dialog";
import { Sparkles, Loader, AlertCircle, CheckCircle } from "lucide-react";

interface RefinementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefineSteps: () => Promise<void>;
  steps: string[];
}

export const RefinementPanel: React.FC<RefinementPanelProps> = ({
  isOpen,
  onClose,
  onRefineSteps,
  steps,
}) => {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRefine = async () => {
    if (steps.length === 0) {
      setError("No steps to refine");
      return;
    }

    setError("");
    setSuccess("");
    setIsRefining(true);

    try {
      await onRefineSteps();
      setSuccess("Steps refined successfully!");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refine steps");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg ">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-custom" />
            Refine Steps with AI
          </AlertDialogTitle>
          <AlertDialogDescription>
            Improve clarity of your {steps.length} step
            {steps.length !== 1 ? "s" : ""} using AI.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
            <h4 className="text-sm font-medium text-blue-custom mb-2">
              🤖 What will AI do?
            </h4>
            <p className="text-sm text-blue-700">
              AI will analyze your steps and make them clearer and easier to
              understand while maintaining their original meaning. This improves
              readability and ensures your instructions are easy to follow.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-blue-custom bg-blue-50 p-3 rounded-xl border border-blue-200">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isRefining}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefine}
              disabled={isRefining || steps.length === 0}
              className="flex-1 bg-blue-custom hover:bg-blue-custom/90 text-white cursor-pointer"
            >
              {isRefining ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refine Steps
                </>
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
