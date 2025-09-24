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
  mode,
  stepDescription,
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
      className={`screenshot-item bg-gray-50 py-4 px-6 transition-all duration-200 ${
        isDragging ? "shadow-lg scale-105" : ""
      }`}
    >
      <div className="flex items-center gap-3 w-full">
        {mode === "edit" && (
          <span
            className="cursor-grab active:cursor-grabbing hover:text-gray-600 flex-shrink-0"
            {...(dragAttributes as DraggableAttributes)}
            {...(dragListeners as SyntheticListenerMap)}
          >
            <GripVertical className="w-4 h-4" />
          </span>
        )}
        <div className="flex-1">
          <textarea
            ref={inputRef}
            className={`w-full h-auto resize-none font-bold text-lg text-gray-700 underline text-center break-words break-all ${
              mode === "edit"
                ? "bg-white border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                : "bg-transparent border-none cursor-default"
            }`}
            value={stepDescription}
            readOnly={mode !== "edit"}
            disabled={mode !== "edit"}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === "edit" ? "Enter header title..." : ""}
            rows={1}
            style={{
              minHeight: "2rem",
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
        </div>
        {mode === "edit" && (
          <div className="flex-shrink-0">
            <CustomAlertDialog
              title="Delete Header Step"
              description={`Are you sure you want to delete this header step?`}
              onConfirm={() => handleDeleteStep(stepId)}
              triggerDescription={
                <div className="p-1 hover:bg-red-50 rounded cursor-pointer transition-colors">
                  <Trash
                    aria-label="Delete Step"
                    role="button"
                    className="w-4 h-4 text-red-500 hover:text-red-700"
                  />
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderStep;
