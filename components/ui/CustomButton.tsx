import React from "react";
import Image from "next/image";

type Props = {
  label?: string;
  icon?: string | undefined;
  onClick?: () => void;
  variant?: "default" | "primary" | "secondary";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  icon2?: string; // Optional second icon
};

const CustomButton = (props: Props) => {
  const getVariantStyles = () => {
    switch (props.variant) {
      case "primary":
        return "bg-blue-custom text-white hover:bg-blue-600";
      case "secondary":
        return "bg-gray-50 text-blue-700 hover:bg-gray-100 border border-gray-300 w-full";
      default:
        return "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300";
    }
  };

  const getSizeStyles = () => {
    switch (props.size) {
      case "small":
        return "px-4 py-2 text-base min-w-[180px]";
      case "large":
        return "px-6 py-3 text-lg min-w-[250px]";
      default:
        return "px-4 py-2 text-base";
    }
  };

  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={`
        flex items-center justify-center
        rounded-md
        transition-all duration-200
        hover:scale-105
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        mx-1
        cursor-pointer
        gap-2
        ${getVariantStyles()}
        ${getSizeStyles()}
      `}
    >
      {props.icon && (
        <Image
          src={props.icon}
          alt={`${props.label} button icon`}
          width={20}
          height={20}
        />
      )}
      {props.label && <span>{props.label}</span>}
      {props.icon2 && (
        <div className="flex items-end justify-end border-l border-blue-800 pl-2">
          <Image
            src={props.icon2}
            alt={`${props.label || ""} button second icon`}
            width={20}
            height={20}
          />
        </div>
      )}
    </button>
  );
};

export default CustomButton;
