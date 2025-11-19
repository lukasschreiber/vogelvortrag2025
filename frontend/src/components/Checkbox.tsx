import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
    label?: string;
    required?: boolean;
    value: boolean;
    onChange?: (value: boolean) => void;
}

export function Checkbox({ value, label, required = false, onChange, className = "", ...props }: CheckboxProps) {
    return (
        <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange?.(e.target.checked)}
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
