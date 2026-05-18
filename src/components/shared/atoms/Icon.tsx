import React from "react";

interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
}

const Icon: React.FC<IconProps> = ({ name, className = "", fill = false }) => {
  return (
    <span
      className={`material-symbols-outlined cursor-pointer ${fill ? "font-fill" : ""} ${className}`}
    >
      {name}
    </span>
  );
};

export default Icon;
