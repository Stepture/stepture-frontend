import React from "react";
import { MousePointer, Lightbulb, TriangleAlert, Heading } from "lucide-react";

type Props = {
  label?: string;

  onClick?: () => void;
  variant?: "step" | "tips" | "ALERT" | "header";
};

const AddStepButton = (props: Props) => {
  const getVariantStyles = () => {
    switch (props.variant) {
      case "step":
        return "bg-purple-100 hover:bg-purple-200 text-purple-800";
      case "tips":
        return "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
      case "ALERT":
        return "bg-red-100 hover:bg-red-200 text-red-800";
      case "header":
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
      default:
        return "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300";
    }
  };

  const getVariantIcons = () => {
    switch (props.variant) {
      case "step":
        return <MousePointer size={20} className="text-purple-600" />;
      case "tips":
        return <Lightbulb size={20} className="text-yellow-600" />;
      case "ALERT":
        return <TriangleAlert size={20} className="text-red-600" />;
      case "header":
        return <Heading size={20} className="text-gray-600" />;
      default:
        return <MousePointer size={20} className="text-gray-600" />;
    }
  };

  const Icon = getVariantIcons();

  return (
    <button
      onClick={props.onClick}
      className={`
        min-w-24
        min-h-16
        flex items-center justify-center flex-col
        rounded-full
        p-2
        transition-all duration-200
        hover:scale-105
        active:scale-95
        mx-1
        cursor-pointer
        gap-1
        ${getVariantStyles()}
      `}
    >
      {Icon}
      {props.label && <span>{props.label}</span>}
    </button>
  );
};

export default AddStepButton;
