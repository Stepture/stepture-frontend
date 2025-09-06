import React, { useRef, useEffect } from "react";
import { Trash, GripVertical } from "lucide-react";
import CustomAlertDialog from "@/components/ui/Common/CustomAlertDialog";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DraggableAttributes } from "@dnd-kit/core";

interface InfoStepProps {
  index: number;
  mode: string;
  stepDescription: string;
  stepNumber: number;
  stepId: string;
  onStepDescriptionChange?: (stepId: string, newDescription: string) => void;
  handleDeleteStep: (id: string) => void;
  dragAttributes?: unknown;
  dragListeners?: unknown;
  isDragging?: boolean;
}

const InfoStep: React.FC<InfoStepProps> = ({
  index,
  mode,
  stepDescription,
  stepNumber,
  stepId,
  onStepDescriptionChange,
  handleDeleteStep,
  dragAttributes,
  dragListeners,
  isDragging,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const originalDescriptionRef = useRef<string>(stepDescription);

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

  useEffect(() => {
    originalDescriptionRef.current = stepDescription;
  }, [stepDescription]);

  return (
    <div
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
            <span className="px-3 py-1 rounded-md font-semibold text-blue-600 bg-blue-200 min-w-24 text-center">
              info {index + 1}
            </span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-md font-semibold text-blue-600 bg-blue-200 min-w-24 text-center">
            info {index + 1}
          </span>
        )}
        <div className="flex-1">
          <textarea
            ref={inputRef}
            className={`rounded-md w-full h-auto overflow-hidden ${
              mode === "edit"
                ? "border-blue-300 bg-white px-2 cursor-text border-none focus:outline-none ring-2 ring-blue-100 focus:ring-2 focus:ring-blue-500"
                : "font-semibold bg-transparent border-none cursor-default text-blue-800"
            }`}
            value={stepDescription}
            readOnly={mode !== "edit"}
            disabled={mode !== "edit"}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === "edit" ? "Enter info description..." : ""}
            rows={1}
            style={{ minHeight: "2.5rem" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${target.scrollHeight}px`;
            }}
          />
        </div>
        {mode === "edit" && (
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-sm cursor-pointer hover:bg-red-100 transition-colors">
              <CustomAlertDialog
                title="Delete Info Step"
                description={`Are you sure you want to delete this info step? `}
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
    </div>
  );
};

export default InfoStep;
