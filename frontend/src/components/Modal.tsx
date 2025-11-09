import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import XMarkIcon from "../assets/icons/xmark.svg?react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children?: React.ReactNode;
    /** Optional footer content (e.g., action buttons) */
    footer?: React.ReactNode;
    /** Close when clicking outside the dialog panel */
    closeOnBackdrop?: boolean;
    /** Close when pressing Escape */
    closeOnEsc?: boolean;
    /** Show an "X" button in the top-right */
    showCloseButton?: boolean;
    /** Size of the dialog */
    size?: ModalSize;
    /** Element to focus when the modal opens */
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    /** Custom className for the panel */
    className?: string;
}

// ---- Helpers
const sizeToClasses: Record<ModalSize, string> = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

function getFocusable(container: HTMLElement): HTMLElement[] {
    const selectors = [
        "a[href]",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    return Array.from(container.querySelectorAll<HTMLElement>(selectors)).filter(
        (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
    );
}

// Create (or reuse) a portal root for modals
function usePortalRoot(id = "modal-root") {
    const rootRef = useRef<HTMLElement | null>(null);
    useEffect(() => {
        let el = document.getElementById(id) as HTMLElement | null;
        if (!el) {
            el = document.createElement("div");
            el.id = id;
            document.body.appendChild(el);
        }
        rootRef.current = el;
        return () => {
            // Keep the root around; removing can cause flicker if multiple modals are used
        };
    }, [id]);
    return rootRef.current;
}

export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    closeOnBackdrop = true,
    closeOnEsc = true,
    showCloseButton = true,
    size = "md",
    initialFocusRef,
    className = "",
}: ModalProps) {
    const portalRoot = usePortalRoot();
    const panelRef = useRef<HTMLDivElement | null>(null);
    const lastActiveRef = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(open);

    // Animate mount/unmount using a simple visibility state
    useEffect(() => {
        if (open) {
            setIsVisible(true);
        } else {
            // let the fade-out animation play before removing from DOM
            const t = setTimeout(() => setIsVisible(false), 150);
            return () => clearTimeout(t);
        }
    }, [open]);

    // Lock background scroll
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    // Focus management & trap
    useEffect(() => {
        if (!open) return;
        lastActiveRef.current = document.activeElement as HTMLElement | null;

        const panel = panelRef.current;
        if (!panel) return;

        const focusables = getFocusable(panel);
        const toFocus = initialFocusRef?.current || focusables[0] || panel;
        toFocus?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && closeOnEsc) {
                e.preventDefault();
                onClose();
            } else if (e.key === "Tab") {
                if (!panel) return;
                // trap focus within panel
                const els = getFocusable(panel);
                if (els.length === 0) {
                    e.preventDefault();
                    panel.focus();
                    return;
                }
                const first = els[0];
                const last = els[els.length - 1];
                const active = document.activeElement as HTMLElement | null;
                if (e.shiftKey) {
                    if (active === first || active === panel) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (active === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        }

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            lastActiveRef.current?.focus?.();
        };
    }, [open, closeOnEsc, onClose, initialFocusRef]);

    if (!portalRoot) return null;
    if (!isVisible) return null;

    const titleId = title ? "modal-title-" + Math.random().toString(36).slice(2) : undefined;

    return createPortal(
        <div
            className={`fixed inset-0 z-1100 flex items-center justify-center p-4 ${open ? "" : "pointer-events-none"}`}
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 transition-opacity duration-150 ${open ? "opacity-100" : "opacity-0"}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (closeOnBackdrop) onClose();
                }}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`relative w-full ${sizeToClasses[size]} max-h-[85vh] overflow-auto rounded-2xl bg-white p-4 shadow-2xl outline-none transition-all duration-150 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${className}`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="mb-3 flex items-start justify-between gap-4">
                        {title ? (
                            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
                                {title}
                            </h2>
                        ) : (
                            <span />
                        )}

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                aria-label="Close"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="text-gray-700">{children}</div>

                {/* Footer */}
                {footer && <div className="mt-6 flex items-center justify-end gap-2">{footer}</div>}
            </div>
        </div>,
        portalRoot
    );
}
