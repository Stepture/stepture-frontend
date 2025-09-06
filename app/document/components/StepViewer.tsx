import React from "react";
// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Step } from "../document.types";
import DirectionStep from "./StepType/DirectionStep";
import WarningStep from "./StepType/WarningStep";
import HeaderStep from "./StepType/HeaderStep";
import HandleAddNewStep from "./HandleAddNewStep";
import InfoStep from "./StepType/InfoStep";

interface StepViewerProps {
  steps: Step[];
  mode: string;
  onStepDescriptionChange?: (stepId: string, newDescription: string) => void;
  onDeleteStep: (id: string) => void;
  onAddNewImage?: (stepNumber: number) => void;
  onDeleteImage?: (stepNumber: number) => void;
  onStepsReorder?: (newSteps: Step[]) => void;
  onAddNewStep?: (selectedType: string, index: number) => void;
  loading?: boolean;
  annotationColor?: string;
}

// Step renderer component that decides which step type to render
const StepRenderer = ({
  step,
  index,
  mode,
  onStepDescriptionChange,
  handleDeleteStep,
  handleAddNewImage,
  handleDeleteImage,
  loading,
  dragAttributes,
  dragListeners,
  isDragging,
  annotationColor,
}: {
  step: Step;
  index: number;
  mode: string;
  onStepDescriptionChange?: (stepId: string, newDescription: string) => void;
  handleDeleteStep: (id: string) => void;
  handleAddNewImage?: (stepNumber: number) => void;
  handleDeleteImage?: (stepNumber: number) => void;
  loading?: boolean;
  dragAttributes?: unknown;
  dragListeners?: unknown;
  isDragging?: boolean;
  annotationColor?: string;
}) => {
  const commonProps = {
    index,
    mode,
    stepDescription: step.stepDescription || "",
    stepNumber: step.stepNumber || 0,
    stepId: step.id || "",
    onStepDescriptionChange,
    handleDeleteStep,
    dragAttributes,
    dragListeners,
    isDragging,
  };

  switch (step.type) {
    case "TIPS":
      console.log("Rendering InfoStep for step:", step);
      return <InfoStep {...commonProps} />;

    case "ALERT":
      return <WarningStep {...commonProps} />;

    case "HEADER":
      return <HeaderStep {...commonProps} />;

    case "STEP":
    default:
      return (
        <DirectionStep
          {...commonProps}
          img={step.screenshot?.url || ""}
          info={step.screenshot}
          handleAddNewImage={handleAddNewImage}
          handleDeleteImage={handleDeleteImage}
          loading={loading}
          annotationColor={annotationColor}
        />
      );
  }
};

// Sortable wrapper component for drag and drop
const SortableStepItem = ({
  step,
  index,
  mode,
  onStepDescriptionChange,
  handleDeleteStep,
  handleAddNewImage,
  handleDeleteImage,
  onAddNewStep,
  steps,
  loading,
  annotationColor,
}: {
  step: Step;
  index: number;
  mode: string;
  onStepDescriptionChange?: (stepId: string, newDescription: string) => void;
  handleDeleteStep: (id: string) => void;
  handleAddNewImage?: (stepNumber: number) => void;
  handleDeleteImage?: (stepNumber: number) => void;
  onAddNewStep?: (selectedType: string, index: number) => void;
  steps: Step[];
  loading?: boolean;
  annotationColor?: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id || `step-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <StepRenderer
        step={step}
        index={index}
        mode={mode}
        onStepDescriptionChange={onStepDescriptionChange}
        handleDeleteStep={handleDeleteStep}
        handleAddNewImage={handleAddNewImage}
        handleDeleteImage={handleDeleteImage}
        loading={loading}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
        annotationColor={annotationColor}
      />
      {onAddNewStep && (
        <HandleAddNewStep
          steps={steps}
          mode={mode}
          stepIndex={index}
          onAddNewStep={onAddNewStep}
        />
      )}
    </div>
  );
};

const StepViewer: React.FC<StepViewerProps> = ({
  steps,
  mode,
  onStepDescriptionChange,
  onDeleteStep,
  onAddNewImage,
  onDeleteImage,
  onStepsReorder,
  onAddNewStep,
  loading,
  annotationColor,
}) => {
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex(
        (step) => (step.id || `step-${steps.indexOf(step)}`) === active.id
      );
      const newIndex = steps.findIndex(
        (step) => (step.id || `step-${steps.indexOf(step)}`) === over?.id
      );

      const newSteps = arrayMove(steps, oldIndex, newIndex);

      // Update step numbers after reordering
      const updatedSteps = newSteps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));

      onStepsReorder?.(updatedSteps);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {mode === "edit" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={steps.map(
              (step) => step.id || `step-${steps.indexOf(step)}`
            )}
            strategy={verticalListSortingStrategy}
          >
            {steps.map((step, index) => (
              <SortableStepItem
                key={step.id || index}
                step={step}
                index={index}
                mode={mode}
                onStepDescriptionChange={onStepDescriptionChange}
                handleDeleteStep={onDeleteStep}
                handleAddNewImage={onAddNewImage}
                handleDeleteImage={onDeleteImage}
                onAddNewStep={onAddNewStep}
                steps={steps}
                loading={loading}
                annotationColor={annotationColor}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        steps.map((step, index) => (
          <StepRenderer
            key={step.id || index}
            step={step}
            index={index}
            mode={mode}
            onStepDescriptionChange={onStepDescriptionChange}
            handleDeleteStep={onDeleteStep}
            handleAddNewImage={onAddNewImage}
            handleDeleteImage={onDeleteImage}
            loading={loading}
            annotationColor={annotationColor}
          />
        ))
      )}
    </div>
  );
};

export default StepViewer;
