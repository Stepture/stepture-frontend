import React, { useRef, useEffect } from "react";
import { Trash, GripVertical } from "lucide-react";
import CustomAlertDialog from "@/components/ui/Common/CustomAlertDialog";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DraggableAttributes } from "@dnd-kit/core";

interface HeaderStepProps {
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

const HeaderStep: React.FC<HeaderStepProps> = ({
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
      className={`screenshot-item border border-gray-300 rounded-lg p-6 bg-gray-100 flex flex-col items-start gap-3 shadow-sm transition-all duration-200 ${
        isDragging ? "shadow-lg scale-105" : ""
      }`}
    >
      <div className="flex items-start gap-2 text-sm font-medium w-full">
        {mode === "edit" ? (
          <span
            className="cursor-grab active:cursor-grabbing hover:text-gray-800"
            {...(dragAttributes as DraggableAttributes)}
            {...(dragListeners as SyntheticListenerMap)}
          >
            <GripVertical className="w-4 h-4 inline-block" />{" "}
            <span className="px-3 py-1 rounded-md font-semibold text-gray-700 bg-gray-300 min-w-24 text-center">
              header
            </span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-md font-semibold text-gray-700 bg-gray-300 min-w-24 text-center">
            header
          </span>
        )}
        <div className="flex-1">
          <textarea
            ref={inputRef}
            className={`rounded-md w-full h-auto overflow-hidden text-xl font-bold ${
              mode === "edit"
                ? "border-gray-300 bg-white px-2 cursor-text border-none focus:outline-none ring-2 ring-gray-100 focus:ring-2 focus:ring-gray-500"
                : "bg-transparent border-none cursor-default text-gray-800"
            }`}
            value={stepDescription}
            readOnly={mode !== "edit"}
            disabled={mode !== "edit"}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === "edit" ? "Enter header text..." : ""}
            rows={1}
            style={{ minHeight: "3rem" }}
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
                title="Delete Header Step"
                description={`Are you sure you want to delete this header step? `}
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

export default HeaderStep;
