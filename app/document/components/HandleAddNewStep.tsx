import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import ChooseStepType from "./ChooseStepType";
import { Step } from "../document.types";

interface HandleAddNewStepProps {
  steps: Step[];
  mode: string;
  stepIndex: number; // Index where the add button should appear
  onAddNewStep: (selectedType: string, index: number) => void;
  showAsEmpty?: boolean; // When there are no steps at all
}

const HandleAddNewStep: React.FC<HandleAddNewStepProps> = ({
  steps,
  mode,
  stepIndex,
  onAddNewStep,
  showAsEmpty = false,
}) => {
  const [showStepTypeModelAt, setShowStepTypeModelAt] = useState<number | null>(
    null
  );

  const handleShowStepTypeModel = (index: number) => {
    setShowStepTypeModelAt(showStepTypeModelAt === index ? null : index);
  };

  if (mode !== "edit") {
    return null;
  }

  const actualIndex = showAsEmpty ? 0 : stepIndex;
  const isShowing = showStepTypeModelAt === actualIndex;

  return (
    <>
      <div className="relative flex items-center justify-center my-8">
        <div className="w-full border-t border-dotted border-gray-200 absolute top-1/2 left-0 z-0" />
        <div className="relative z-10 flex justify-center w-full">
          <div
            className="bg-white border border-gray-200 shadow-sm rounded-full w-10 h-10 flex items-center justify-center mx-auto transition-colors hover:bg-blue-100 cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add new step"
            role="button"
            onClick={() => handleShowStepTypeModel(actualIndex)}
          >
            {isShowing ? (
              <X size={20} className="text-gray-400" />
            ) : (
              <Plus size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center">
        {isShowing && (
          <ChooseStepType
            onStepTypeSelect={(selectedType) => {
              onAddNewStep(selectedType, stepIndex);
              setShowStepTypeModelAt(null);
            }}
          />
        )}
      </div>
    </>
  );
};

export default HandleAddNewStep;
