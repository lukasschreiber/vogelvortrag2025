import React from "react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
}

export function Select({ label, options, className = "", ...props }: SelectProps) {
    return (
        <div className="space-y-1">
            {label && <label className="block text-sm text-gray-600">{label}</label>}
            <select
                {...props}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${className}`}
            >
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
}
