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
import { useComboSkillPopover } from "./combo-skill-popover-context";
import { useLocale } from "next-intl";
import { getSkillDisplayData } from "@/lib/skill-utils";
import { CompactSkillItem } from "@/components/formation/compact-skill-item";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * GlobalComboSkillPopover - A single global popover instance for combo skills
 *
 * This component renders the skill popover based on the global context state.
 * It's mounted once and stays in the DOM, only changing its content and position
 * when the active skill changes. This eliminates mount/unmount flicker.
 *
 * Key features:
 * - Single instance in the DOM (vs N instances before)
 * - Zero mount/unmount cycles
 * - Centralized positioning logic
 * - Desktop mouse-following behavior
 */
export function GlobalComboSkillPopover() {
  const {
    activeSkill,
    anchorPosition,
    isOpen,
    portalContainer,
    closePopover,
  } = useComboSkillPopover();

  const popoverRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const [realtimeMousePosition, setRealtimeMousePosition] = useState<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<{ x: number; y: number } | null>(null);

  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Use activeSkill identifier to stabilize the dependency
  const skillData = useMemo(() => {
    if (!activeSkill) return null;

    let skill = null;

    if (activeSkill.skillType === 'mystery' && activeSkill.ninja.mysterySkill) {
      skill = activeSkill.ninja.mysterySkill;
    } else if (activeSkill.skillType === 'attack' && activeSkill.ninja.standardAttackSkill) {
      skill = activeSkill.ninja.standardAttackSkill;
    } else if (activeSkill.skillType === 'chase') {
      if (activeSkill.chaseIndex !== undefined && activeSkill.ninja.chaseSkills[activeSkill.chaseIndex - 1]) {
        skill = activeSkill.ninja.chaseSkills[activeSkill.chaseIndex - 1];
      } else {
        skill = activeSkill.ninja.chaseSkills.find(s => s.id === activeSkill.skillId);
      }
    }

    if (!skill) return null;

    return getSkillDisplayData(skill, activeSkill.skillType, activeSkill.ninja, activeSkill.chaseIndex, locale);
  }, [activeSkill?.ninja.id, activeSkill?.skillId, activeSkill?.skillType, activeSkill?.chaseIndex, locale]);

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && popoverRef.current) {
      // Height is automatically determined by content
    }
  }, [isOpen, activeSkill]);

  // Consolidated positioning logic
  const calculatedPopoverPosition = useMemo(() => {
    if (!anchorPosition) return { top: 0, left: 0 };

    const mousePos = realtimeMousePosition || anchorPosition;
    const popoverWidth = 450;
    const popoverHeight = 400; // Altura estimada do popover
    const offsetX = 30;
    const offsetY = -20; // Posiciona ligeiramente acima do cursor

    let left = mousePos.x + offsetX;
    let top = mousePos.y + offsetY;

    // Ajuste horizontal se sair da tela à direita
    if (left + popoverWidth > window.innerWidth - 10) {
      left = mousePos.x - popoverWidth - offsetX;
    }

    // Ajuste horizontal se sair da tela à esquerda
    if (left < 10) {
      left = 10;
    }

    // Ajuste vertical se sair da tela embaixo
    if (top + popoverHeight > window.innerHeight - 10) {
      top = window.innerHeight - popoverHeight - 10;
    }

    // Ajuste vertical se sair da tela em cima
    if (top < 10) {
      top = 10;
    }

    return { top, left };
  }, [anchorPosition, realtimeMousePosition]);

  // Handle window resize - recalculate position
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      // Position will be recalculated by the useMemo above
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const transitionStyle = useMemo(() => {
    if (prefersReducedMotion) {
      return 'none';
    }
    return 'transform 50ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 100ms ease-out';
  }, [prefersReducedMotion]);

  const shouldRenderContent = isOpen && skillData !== null;

  if (!activeSkill || !portalContainer || !skillData) {
    return null;
  }

  return createPortal(
    <div
      ref={popoverRef}
      aria-hidden={!isOpen}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        transform: `translate(${calculatedPopoverPosition.left}px, ${calculatedPopoverPosition.top}px)`,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: transitionStyle,
        willChange: isOpen ? 'transform, opacity' : 'auto',
        zIndex: 9999,
      }}
    >
      <div className="bg-neutral-950 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden max-w-[450px]">
        {shouldRenderContent && (
          <div className="p-3">
            <CompactSkillItem skill={skillData} />
          </div>
        )}
      </div>
    </div>,
    portalContainer
  );
}
