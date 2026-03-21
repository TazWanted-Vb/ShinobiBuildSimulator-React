"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  onClose?: () => void;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({ children, className, title, onClose }: DialogContentProps) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Check if click is inside dialog content
      if (contentRef.current && contentRef.current.contains(target)) {
        return;
      }

      // Check if click is on a dropdown element (high z-index elements like select dropdowns)
      // We check if the clicked element or any of its parents has a very high z-index
      let element: HTMLElement | null = target as HTMLElement;
      let isDropdownClick = false;

      while (element && element !== document.body) {
        const computedStyle = window.getComputedStyle(element);
        const zIndex = parseInt(computedStyle.zIndex);

        // If element has z-index >= 1000, it's likely a dropdown
        if (zIndex >= 1000) {
          isDropdownClick = true;
          break;
        }

        // Also check for fixed position elements that might be dropdowns
        if (computedStyle.position === 'fixed' && zIndex > 50) {
          isDropdownClick = true;
          break;
        }

        element = element.parentElement;
      }

      // Only close dialog if not clicking on a dropdown
      if (!isDropdownClick) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  // Use ReactDOM.createPortal to render the dialog at document.body level
  // This ensures the dialog is not affected by parent container CSS rules
  // like overflow, position, and stacking context limitations
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - header-style styling with more opacity and blur */}
      <div
        className="fixed inset-0 z-0 bg-black/80 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          "relative z-10 w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl",
          "max-h-[90vh] flex flex-col",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onClose?.();
              }}
              className="p-1 rounded hover:bg-neutral-800 transition-colors"
            >
              <Icon icon="solar:close-circle-linear" className="w-6 h-6 text-neutral-400" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}>
      {children}
    </h2>
  );
}
