"use client";

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useSkillsPopover } from "./skills-popover-context";
import { useLocale } from "next-intl";
import { getAllSkillsForNinjaWithEvolutions } from "@/lib/skill-utils";
import {
  CompactSkillItem,
  MemoizedCompactSkillItem,
} from "./compact-skill-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@iconify/react";
import { useFormationActions } from "@/components/providers/formation-provider";

/**
 * GlobalSkillsPopover - A single global popover instance
 *
 * This component renders the skills popover based on the global context state.
 * It's mounted once and stays in the DOM, only changing its content and position
 * when the active ninja changes. This eliminates mount/unmount flicker.
 *
 * Key features:
 * - Single instance in the DOM (vs N instances before)
 * - Zero mount/unmount cycles
 * - Centralized positioning logic
 * - Global scroll and resize listeners
 * - Dual-mode: desktop mouse-following + mobile bottom sheet
 */
export function GlobalSkillsPopover() {
  const {
    activeNinja,
    anchorPosition,
    popoverHeight,
    popoverPosition,
    isOpen,
    isScrolling,
    setPopoverHeight,
    setPopoverPosition,
    portalContainer,
    isMobileDevice,
    closePopover,
  } = useSkillsPopover();

  // Access formation actions for evolved skills
  const { getEvolvedSkill, getEvolutionSelections } = useFormationActions();

  const popoverRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [realtimeMousePosition, setRealtimeMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);

  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  // Use activeNinja.id instead of entire object to stabilize the dependency
  // Add evolution selections to force re-render when evolutions change
  const evolutionSelections = getEvolutionSelections();
  const evolutionKey = activeNinja ? JSON.stringify(
    Object.entries(evolutionSelections.get(activeNinja.id) || {})
      .map(([cat, sel]) => `${cat}:${sel.path}:${sel.variantIndex}`)
      .sort()
  ) : '';

  const allSkills = useMemo(() => {
    if (!activeNinja) return [];
    // Get skills with evolutions
    const skills = getAllSkillsForNinjaWithEvolutions(activeNinja, getEvolvedSkill, locale);
    // Add stable key to each skill for consistent React rendering
    return skills.map((skill, idx) => ({
      ...skill,
      _stableKey: `${skill.id}-${idx}`,
    }));
  }, [activeNinja?.id, locale, getEvolvedSkill, evolutionKey]);

  useEffect(() => {
    if (isMobileDevice || !isOpen) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      pendingPositionRef.current = { x: e.clientX, y: e.clientY };

      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (pendingPositionRef.current) {
            setRealtimeMousePosition(pendingPositionRef.current);
            pendingPositionRef.current = null;
          }
          rafRef.current = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isOpen, isMobileDevice]);

  useLayoutEffect(() => {
    if (isOpen && popoverRef.current && !isScrolling) {
      const height = popoverRef.current.offsetHeight;
      setPopoverHeight(height);
    }
  }, [isOpen, activeNinja?.id, isScrolling, setPopoverHeight]);

  // Consolidated positioning logic in a single useMemo
  const calculatedPopoverPosition = useMemo(() => {
    if (!anchorPosition || isScrolling) return { top: 0, left: 0 };

    if (isMobileDevice) {
      // Mobile: Bottom sheet positioning
      const sheetHeight = popoverHeight || window.innerHeight * 0.7;
      return {
        top: window.innerHeight - sheetHeight,
        left: 0,
      };
    } else {
      const mousePos = realtimeMousePosition || anchorPosition;
      const popoverWidth = 616;
      const offsetX = 20;
      const margin = 10;

      let left = mousePos.x + offsetX;
      let top = mousePos.y;

      if (left + popoverWidth > window.innerWidth - margin) {
        left = mousePos.x - popoverWidth - offsetX;
      }

      if (left < margin) {
        left = margin;
      }

      if (popoverHeight) {
        if (top + popoverHeight > window.innerHeight - margin) {
          top = window.innerHeight - popoverHeight - margin;
        }
        if (top < margin) {
          top = margin;
        }
      }

      return { top, left };
    }
  }, [
    anchorPosition,
    popoverHeight,
    isScrolling,
    realtimeMousePosition,
    isMobileDevice,
  ]);

  // Sync calculated position with context state
  useEffect(() => {
    if (
      !isScrolling &&
      (calculatedPopoverPosition.top !== 0 ||
        calculatedPopoverPosition.left !== 0)
    ) {
      setPopoverPosition(calculatedPopoverPosition);
    }
  }, [calculatedPopoverPosition, isScrolling, setPopoverPosition]);

  useEffect(() => {
    if (!isMobileDevice || !isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        closePopover();
      }
    };

    // Add slight delay to avoid immediate closing after opening
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileDevice, isOpen, closePopover]);

  const transitionStyle = useMemo(() => {
    if (prefersReducedMotion) {
      return "none";
    }
    return isMobileDevice
      ? "transform 250ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease-out"
      : "transform 50ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 100ms ease-out";
  }, [prefersReducedMotion, isMobileDevice]);

  const shouldRenderContent = isOpen && (!isScrolling || isMobileDevice);

  const handleClose = useCallback(() => {
    if (isOpen) {
      closePopover();
    }
  }, [isOpen, closePopover]);

  if (!activeNinja || !portalContainer) {
    return null;
  }

  return createPortal(
    <>
      {/* Mobile backdrop - always rendered when open to allow closing */}
      {isMobileDevice && isOpen && (
        <div
          onClick={handleClose}
          onTouchEnd={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{
            zIndex: 9998,
            animation: "fadeIn 150ms ease-out",
          }}
        />
      )}

      {isMobileDevice ? (
        <div
          ref={popoverRef}
          aria-hidden={!isOpen}
          className="fixed left-0 right-0 bg-neutral-950 border-t border-neutral-700 shadow-2xl z-[9999] mobile-bottom-sheet"
          style={{
            bottom: 0,
            borderRadius: "16px 16px 0 0",
            maxHeight: "70vh",
            overflowY: "auto",
            transform:
              isOpen && !isScrolling ? "translateY(0)" : "translateY(100%)",
            opacity: isOpen && !isScrolling ? 1 : 0,
            pointerEvents: isOpen && !isScrolling ? "auto" : "none",
            transition: transitionStyle,
            willChange: isOpen && !isScrolling ? "transform, opacity" : "auto",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 sticky top-0 bg-neutral-950 z-10">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-orange-500 rounded-full" />
              <h3 className="text-white font-semibold">
                {activeNinja?.nameDisplay || "Skills"}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="p-2 -mr-2 text-neutral-400 hover:text-white active:text-white transition-colors"
              aria-label="Fechar"
            >
              <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
            </button>
          </div>

          {shouldRenderContent && (
            <div className="p-3 space-y-3">
              {allSkills.map((skill, idx) => (
                <MemoizedCompactSkillItem
                  key={`${skill.id}-${idx}`}
                  skill={skill}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={popoverRef}
          aria-hidden={!isOpen}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            transform: `translate(${popoverPosition.left}px, ${popoverPosition.top}px)`,
            opacity: isOpen && !isScrolling ? 1 : 0,
            pointerEvents: "none",
            transition: transitionStyle,
            willChange: isOpen && !isScrolling ? "transform, opacity" : "auto",
            zIndex: 9999,
          }}
        >
          <div className="bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-w-[616px]">
            {shouldRenderContent && (
              <div className="p-3 space-y-3">
                {allSkills.map((skill, idx) => (
                  <MemoizedCompactSkillItem
                    key={`${skill.id}-${idx}`}
                    skill={skill}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    portalContainer,
  );
}
