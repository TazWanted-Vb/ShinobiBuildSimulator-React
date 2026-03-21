"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { SelectOption } from "@/lib/types";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  showIcons?: boolean;
}

export const Select = React.memo(function Select({
  value,
  onValueChange,
  options,
  placeholder = "Selecionar...",
  className,
  showIcons = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Memoize handlers to prevent re-renders
  const toggleOpen = React.useCallback(() => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setIsOpen(prev => !prev);
  }, [isOpen]);

  // Close on outside click - supports both mouse and touch
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        isOpen &&
        triggerRef.current &&
        dropdownRef.current &&
        !triggerRef.current.contains(target) &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  React.useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  const dropdown = isOpen && typeof window !== "undefined" ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] max-h-[50vh] sm:max-h-80 overflow-y-auto custom-scrollbar rounded border border-neutral-800 bg-neutral-950 shadow-xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onValueChange(option.value);
            setIsOpen(false);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onValueChange(option.value);
            setIsOpen(false);
          }}
          className={cn(
            "flex items-center gap-2 w-full px-4 sm:px-3 py-3.5 sm:py-2.5 text-xs sm:text-sm text-left transition-colors min-h-[48px] sm:min-h-[44px] border-b border-neutral-800/50 last:border-b-0",
            value === option.value
              ? "bg-neutral-800 text-white font-medium"
              : "text-neutral-400 hover:bg-neutral-900 hover:text-white active:bg-neutral-800",
          )}
        >
          {showIcons && option.iconSrc && (
            <Image
              src={option.iconSrc}
              alt={option.iconAlt || ''}
              width={20}
              height={20}
              className="rounded-sm flex-shrink-0"
            />
          )}
          <span>{option.label}</span>
        </button>
      ))}
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex items-center justify-between gap-2 w-full px-3 sm:px-3 py-3 sm:py-2 text-xs sm:text-sm rounded border transition-colors min-h-[48px] sm:min-h-[40px]",
          "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 active:border-neutral-600 active:scale-[0.98]",
          isOpen && "border-neutral-600",
        )}
      >
        <span className="flex items-center gap-2 truncate">
          {showIcons && selectedOption?.iconSrc && (
            <Image
              src={selectedOption.iconSrc}
              alt={selectedOption.iconAlt || ''}
              width={20}
              height={20}
              className="rounded-sm flex-shrink-0"
            />
          )}
          <span>{selectedLabel}</span>
        </span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={cn(
            "text-neutral-500 transition-transform shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {dropdown}
    </div>
  );
});
