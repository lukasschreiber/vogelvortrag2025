import React from "react";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    readOnly?: boolean;
    required?: boolean;
}

export function Select({ label, options, readOnly = false, required, className = "", ...props }: SelectProps) {
    return (
        <div className="flex flex-col space-y-1.5 w-full relative">
            {label && <label className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</label>}
            <select
                {...props}
                disabled={readOnly}
                className={`w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
          placeholder:text-gray-400
          transition-all duration-150 outline-none
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500
          ${className}
        `}
            >
                {options.map(({ value, label }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-9 text-gray-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
}
