"use client";

import { useRef, useEffect, useCallback, useContext, useState } from "react";
import type { Ninja } from "@/lib/types";
import { useComboSkillPopover } from "@/components/combos/combo-skill-popover-context";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SkillPopoverProps {
  ninja: Ninja;
  skillId: string;
  skillType: 'mystery' | 'attack' | 'chase';
  chaseIndex?: number;
  children: React.ReactNode;
}

/**
 * SkillPopover - Trigger component for the global combo skill popover
 *
 * This component is a lightweight trigger that:
 * 1. Detects hover events on skill images
 * 2. Manages timers for open/close delays
 * 3. Calls the global context to show/hide the popover
 * 4. Tracks mouse position for popover positioning
 *
 * It does NOT render the popover itself - that's handled by GlobalComboSkillPopover.
 */
export function SkillPopover({
  ninja,
  skillId,
  skillType,
  chaseIndex,
  children,
}: SkillPopoverProps) {
  // Use global popover context
  const {
    openPopover,
    closePopover,
    updatePosition,
  } = useComboSkillPopover();

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect desktop via media query (reactive - updates on device changes)
  const isDesktop = useMediaQuery("(hover: hover)");

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isDesktop || !isClient) return;

    // Clear previous timers
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Immediate open
    openPopover(ninja, skillId, skillType, chaseIndex, { x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    if (!isDesktop || !isClient) return;

    // Clear timers
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Delay close para evitar que o popover feche quando o mouse se move
    hideTimerRef.current = setTimeout(() => {
      closePopover();
    }, 150);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDesktop || !isClient) return;

    // Cancel the hide timer if the mouse is still moving over the element
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // Update mouse position
    updatePosition({ x: e.clientX, y: e.clientY });
  };

  if (!isClient || !isDesktop) {
    return <>{children}</>;
  }

  return (
    <div
      ref={triggerRef}
      className="contents"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}
