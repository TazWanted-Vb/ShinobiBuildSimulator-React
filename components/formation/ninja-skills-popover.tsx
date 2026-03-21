"use client";

import React, { useRef, useEffect, useCallback, useContext } from "react";
import type { Ninja } from "@/lib/types";
import { DragStateContext } from "@/components/dnd/formation-dnd-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSkillsPopover } from "@/components/formation/skills-popover-context";
import { getAllSkillsForNinjaWithEvolutions } from "@/lib/skill-utils";
import { useLocale } from "next-intl";
import { useFormationActions } from "@/components/providers/formation-provider";

interface NinjaSkillsPopoverProps {
  ninja: Ninja;
  children: React.ReactNode;
  disabled?: boolean; // Disable during @dnd-kit drag operations
  slotIndex?: number; // Unique identifier for this popover instance
  onOpenClick?: () => void; // Optional callback for opening popover on click (mobile)
}

/**
 * NinjaSkillsPopover - Trigger component for the global skills popover
 *
 * This component is a lightweight trigger that:
 * 1. Detects hover events on ninja cards
 * 2. Manages timers for open/close delays
 * 3. Calls the global context to show/hide the popover
 * 4. Tracks mouse position for popover positioning
 *
 * It does NOT render the popover itself - that's handled by GlobalSkillsPopover.
 */
export function NinjaSkillsPopover({
  ninja,
  children,
  disabled = false,
  onOpenClick,
}: NinjaSkillsPopoverProps) {
  // Consume global drag state to disable hover on ALL cards during drag
  const { isDragging: isGlobalDragging } = useContext(DragStateContext);

  // Use global popover context
  const { openPopover, closePopover, updatePosition } = useSkillsPopover();

  // Access formation actions for evolved skills
  const { getEvolvedSkill, getEvolutionSelections } = useFormationActions();

  const triggerRef = useRef<HTMLDivElement>(null);

  const locale = useLocale();

  // Force re-render when evolutions change
  const evolutionSelections = getEvolutionSelections();
  const evolutionKey = JSON.stringify(
    Object.entries(evolutionSelections.get(ninja.id) || {})
      .map(([cat, sel]) => `${cat}:${sel.path}:${sel.variantIndex}`)
      .sort()
  );

  // Obter todas as habilidades do ninja CONSIDERANDO EVOLUÇÕES
  const allSkills = React.useMemo(() => {
    return getAllSkillsForNinjaWithEvolutions(ninja, getEvolvedSkill, locale);
  }, [ninja, getEvolvedSkill, locale, evolutionKey]);

  // Detectar desktop via media query (reactive - updates on device changes)
  const isDesktop = useMediaQuery("(hover: hover)");

  // Não mostrar popover se estiver desabilitado, estiver em drag global, ou não houver habilidades
  const hasSkills = allSkills.length > 0;
  const popoverEnabled = !disabled && !isGlobalDragging && hasSkills;

  // Close popover immediately when a drag starts
  useEffect(() => {
    if (isGlobalDragging) {
      closePopover();
    }
  }, [isGlobalDragging, closePopover]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!popoverEnabled) return;

    if (!isGlobalDragging) {
      openPopover(ninja, { x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseLeave = () => {
    if (!popoverEnabled) return;
    closePopover();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!popoverEnabled || !isDesktop) return;
    updatePosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only handle click on mobile when not disabled
    if (!isDesktop && popoverEnabled && onOpenClick) {
      e.stopPropagation(); // Prevent click from reaching inner card
      onOpenClick();
    }
  };

  return (
    <div
      ref={triggerRef}
      data-ninja-id={ninja.id}
      onMouseEnter={isDesktop ? handleMouseEnter : undefined}
      onMouseLeave={isDesktop ? handleMouseLeave : undefined}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      className="contents"
    >
      {children}
    </div>
  );
}
