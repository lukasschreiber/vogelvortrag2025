import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export function Textarea({ label, className = "", ...props }: TextareaProps) {
    return (
        <div className="space-y-1">
            {label && <label className="block text-sm text-gray-600">{label}</label>}
            <textarea
                {...props}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 ${className}`}
            />
        </div>
    );
}
