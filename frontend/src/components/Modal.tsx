import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import XMarkIcon from "../assets/icons/xmark.svg?react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    showCloseButton?: boolean;
    size?: ModalSize;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    className?: string;
    /** Make header sticky */
    stickyHeader?: boolean;
    /** Make footer sticky */
    stickyFooter?: boolean;
}

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
    stickyHeader = false,
    stickyFooter = false,
}: ModalProps) {
    const portalRoot = usePortalRoot();
    const panelRef = useRef<HTMLDivElement | null>(null);
    const lastActiveRef = useRef<HTMLElement | null>(null);
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        if (open) setIsVisible(true);
        else {
            const t = setTimeout(() => setIsVisible(false), 150);
            return () => clearTimeout(t);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

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
                className={`relative w-full ${sizeToClasses[size]} max-h-[85vh] overflow-auto rounded-2xl bg-white shadow-2xl outline-none transition-all duration-150 ${open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${className}`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div
                        className={`flex items-start justify-between gap-4 p-4 ${
                            stickyHeader ? "sticky top-0 bg-gray-200 z-10 mb-2" : "mb-3"
                        }`}
                    >
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
                <div className="px-4 pb-4 text-gray-700">{children}</div>

                {/* Footer */}
                {footer && (
                    <div
                        className={`flex items-center justify-end gap-2 p-4 ${
                            stickyFooter ? "sticky bottom-0 bg-gray-200 mt-2 z-10" : "mt-6"
                        }`}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        portalRoot
    );
}
