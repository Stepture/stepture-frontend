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
          onClick={() => props.onStepTypeSelect?.("step")}
        />
        <AddStepButton
          label="Tips"
          variant="tips"
          onClick={() => props.onStepTypeSelect?.("tips")}
        />
        <AddStepButton
          label="Danger"
          variant="danger"
          onClick={() => props.onStepTypeSelect?.("danger")}
        />
        <AddStepButton
          label="Header"
          variant="header"
          onClick={() => props.onStepTypeSelect?.("header")}
        />
      </div>
    </div>
  );
};

export default ChooseStepType;
