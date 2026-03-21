"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from "react";
import type { Ninja } from "@/lib/types";

interface ComboSkillPopoverState {
  ninja: Ninja;
  skillId: string;
  skillType: 'mystery' | 'attack' | 'chase';
  chaseIndex?: number;
}

interface ComboSkillPopoverContextValue {
  // Global popover state
  activeSkill: ComboSkillPopoverState | null;
  anchorPosition: { x: number; y: number } | null;
  isOpen: boolean;

  // Actions
  openPopover: (ninja: Ninja, skillId: string, skillType: 'mystery' | 'attack' | 'chase', chaseIndex?: number, position?: { x: number; y: number }) => void;
  closePopover: () => void;
  updatePosition: (position: { x: number; y: number }) => void;

  // Container do portal
  portalContainer: HTMLDivElement | null;
}

const ComboSkillPopoverContext = createContext<ComboSkillPopoverContextValue | undefined>(undefined);

export function useComboSkillPopover() {
  const context = useContext(ComboSkillPopoverContext);
  if (!context) {
    throw new Error("useComboSkillPopover must be used within ComboSkillPopoverProvider");
  }
  return context;
}

interface ComboSkillPopoverProviderProps {
  children: ReactNode;
}

// Shared portal container for all combo skill popovers
let globalPortalContainer: HTMLDivElement | null = null;

function getPortalContainer(): HTMLDivElement {
  if (!globalPortalContainer) {
    globalPortalContainer = document.createElement('div');
    globalPortalContainer.style.position = 'fixed';
    globalPortalContainer.style.top = '0';
    globalPortalContainer.style.left = '0';
    globalPortalContainer.style.zIndex = '9999';
    globalPortalContainer.style.pointerEvents = 'none';
    document.body.appendChild(globalPortalContainer);
  }
  return globalPortalContainer;
}

/**
 * Global context to manage combo skill popover state.
 * Ensures only one popover is open at a time across all combo skill cards.
 * Provides a shared portal container for all popovers.
 */
export function ComboSkillPopoverProvider({ children }: ComboSkillPopoverProviderProps) {
  const [globalState, setGlobalState] = useState({
    activeSkill: null as ComboSkillPopoverState | null,
    anchorPosition: null as { x: number; y: number } | null,
    isOpen: false,
  });

  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  // Initialize shared portal container on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const container = getPortalContainer();
      setPortalContainer(container);

      return () => {
        // Note: We don't remove the global container here as it may be used by other instances
      };
    }
  }, []);

  const openPopover = useCallback((
    ninja: Ninja,
    skillId: string,
    skillType: 'mystery' | 'attack' | 'chase',
    chaseIndex?: number,
    position?: { x: number; y: number }
  ) => {
    setGlobalState(prev => ({
      ...prev,
      activeSkill: { ninja, skillId, skillType, chaseIndex },
      anchorPosition: position || prev.anchorPosition,
      isOpen: true,
    }));
  }, []);

  const closePopover = useCallback(() => {
    setGlobalState(prev => ({
      ...prev,
      isOpen: false,
      anchorPosition: null,
    }));
  }, []);

  const updatePosition = useCallback((position: { x: number; y: number }) => {
    setGlobalState(prev => ({
      ...prev,
      anchorPosition: position,
    }));
  }, []);

  return (
    <ComboSkillPopoverContext.Provider
      value={{
        activeSkill: globalState.activeSkill,
        anchorPosition: globalState.anchorPosition,
        isOpen: globalState.isOpen,
        openPopover,
        closePopover,
        updatePosition,
        portalContainer,
      }}
    >
      {children}
    </ComboSkillPopoverContext.Provider>
  );
}

// Export the getPortalContainer function for direct access if needed
export { getPortalContainer };
