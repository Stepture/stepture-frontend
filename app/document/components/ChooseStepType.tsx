import React from "react";
import AddStepButton from "./AddStepButton";

type Props = {
  onStepTypeSelect?: (type: string) => void;
};

const ChooseStepType = (props: Props) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg w-fit bg-blue-200 shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-slate-700">
        Choose Step Type
      </h2>
      <div className="flex items-center justify-center gap-4">
        <AddStepButton
          label="Step"
          variant="step"
          onClick={() => props.onStepTypeSelect?.("STEP")}
        />
        <AddStepButton
          label="Tips"
          variant="tips"
          onClick={() => props.onStepTypeSelect?.("TIPS")}
        />
        <AddStepButton
          label="ALERT"
          variant="ALERT"
          onClick={() => props.onStepTypeSelect?.("ALERT")}
        />
        <AddStepButton
          label="Header"
          variant="header"
          onClick={() => props.onStepTypeSelect?.("HEADER")}
        />
      </div>
    </div>
  );
};

export default ChooseStepType;
