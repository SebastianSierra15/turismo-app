import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`block w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary p-3 transition-all ${icon ? "pr-10" : ""} ${error ? "border-red-500" : ""} ${className}`}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
    </div>
  );
};

export default Input;
