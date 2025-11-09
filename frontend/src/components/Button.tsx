interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    icon?: React.ReactNode;
    variant?: "primary" | "subdue" | "danger";
    disabled?: boolean;
}

export function Button({ children, onClick, icon, variant = "primary", disabled = false, className, ...props }: ButtonProps) {
    const baseClasses =
        "flex items-center px-2 py-1 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none cursor-pointer";
    const variantClasses = {
        primary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500",
        subdue: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
    };
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

    return (
        <button
            {...props}
            onClick={onClick}
            className={`${className} ${baseClasses} ${variantClasses[variant]} ${disabledClasses}`}
            disabled={disabled}
        >
            {icon && <span>{icon}</span>}
            {children && <span className={icon ? "ml-2" : ""}>{children}</span>}
        </button>
    );
}