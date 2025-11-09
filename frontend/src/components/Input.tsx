import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    readOnly?: boolean;
}

export function Input({ label, readOnly = false, className = "", ...props }: InputProps) {
    return (
        <div className="flex flex-col space-y-1.5 w-full">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <input
                {...props}
                readOnly={readOnly}
                className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
          placeholder:text-gray-400
          transition-all duration-150 outline-none
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
          ${readOnly ? "bg-gray-100! text-gray-500!" : "focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
          ${className}
        `}
            />
        </div>
    );
}
