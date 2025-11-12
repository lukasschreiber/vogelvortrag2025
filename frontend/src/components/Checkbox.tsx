import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    required?: boolean;
}

export function Checkbox({ label, required = false, className = "", ...props }: CheckboxProps) {
    return (
        <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
                type="checkbox"
                {...props}
                className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200
                    disabled:cursor-not-allowed disabled:opacity-60
                    ${className}`}
            />
            {label && (
                <span className="text-sm text-gray-700">
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </span>
            )}
        </label>
    );
}
