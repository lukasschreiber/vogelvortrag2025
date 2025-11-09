import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    readOnly?: boolean;
}

export function Input({ label, readOnly = false, className = "", ...props }: InputProps) {
    return (
        <div className="space-y-1">
            {label && <label className="block text-sm text-gray-600">{label}</label>}
            <input
                {...props}
                readOnly={readOnly}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                    readOnly ? "bg-gray-100 text-gray-500" : "focus:ring-blue-500"
                } ${className}`}
            />
        </div>
    );
}
