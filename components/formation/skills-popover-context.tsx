"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import type { Ninja } from "@/lib/types";

interface SkillsPopoverContextValue {
  // Global popover state
  activeNinja: Ninja | null;
  anchorPosition: { x: number; y: number } | null;
  popoverHeight: number | null;
  popoverPosition: { top: number; left: number };
  isOpen: boolean;
  isScrolling: boolean;

  // Mobile detection
  interactionMode: "hover" | "tap";
  isMobileDevice: boolean;

  // Actions
  openPopover: (ninja: Ninja, position: { x: number; y: number }) => void;
  closePopover: () => void;
  updatePosition: (position: { x: number; y: number }) => void;
  setPopoverHeight: (height: number) => void;
  setPopoverPosition: (position: { top: number; left: number }) => void;
  startScroll: () => void;
  endScroll: () => void;

  // Container do portal
  portalContainer: HTMLDivElement | null;
}

const SkillsPopoverContext = createContext<
  SkillsPopoverContextValue | undefined
>(undefined);

export function useSkillsPopover() {
  const context = useContext(SkillsPopoverContext);
  if (!context) {
    throw new Error(
      "useSkillsPopover must be used within SkillsPopoverProvider",
    );
  }
  return context;
}

interface SkillsPopoverProviderProps {
  children: ReactNode;
}

// Shared portal container for all skill popovers
let globalPortalContainer: HTMLDivElement | null = null;

function getPortalContainer(): HTMLDivElement {
  if (!globalPortalContainer) {
    globalPortalContainer = document.createElement("div");
    globalPortalContainer.style.position = "fixed";
    globalPortalContainer.style.top = "0";
    globalPortalContainer.style.left = "0";
    globalPortalContainer.style.zIndex = "9999";
    globalPortalContainer.style.pointerEvents = "none";
    document.body.appendChild(globalPortalContainer);
  }
  return globalPortalContainer;
}

/**
 * Global context to manage skill popover state.
 * Ensures only one popover is open at a time across all ninja cards.
 * Provides a shared portal container for all popovers.
 *
 * Now manages a single global popover instead of multiple instances.
 */
export function SkillsPopoverProvider({
  children,
}: SkillsPopoverProviderProps) {
  // Global popover state
  const [globalState, setGlobalState] = useState({
    activeNinja: null as Ninja | null,
    anchorPosition: null as { x: number; y: number } | null,
    popoverHeight: null as number | null,
    popoverPosition: { top: 0, left: 0 },
    isOpen: false,
    isScrolling: false,
  });

  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  // Detect device type for interaction mode
  // SSR-safe: initialise to non-mobile (server default), then correct on client
  const [deviceDetection, setDeviceDetection] = useState<{
    isMobileDevice: boolean;
    interactionMode: "hover" | "tap";
  }>({ isMobileDevice: false, interactionMode: "hover" });

  useEffect(() => {
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isMobileDevice = !hasHover || !hasFinePointer;
    setDeviceDetection({
      isMobileDevice,
      interactionMode: isMobileDevice ? "tap" : "hover",
    });
  }, []);

  // Initialize shared portal container on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const container = getPortalContainer();
      setPortalContainer(container);

      return () => {
        // Clean up portal container when provider unmounts
        // Note: We don't remove the global container here as it may be used by other instances
        // The container will be cleaned up when the page is unloaded
      };
    }
  }, []);

  // Global popover methods
  const openPopover = useCallback(
    (ninja: Ninja, position: { x: number; y: number }) => {
      setGlobalState((prev) => ({
        ...prev,
        activeNinja: ninja,
        anchorPosition: position,
        isOpen: true,
      }));
    },
    [],
  );

  const closePopover = useCallback(() => {
    setGlobalState((prev) => ({
      ...prev,
      isOpen: false,
      anchorPosition: null,
      // Manter activeNinja para preservar dados durante transição
    }));
  }, []);

  const updatePosition = useCallback((position: { x: number; y: number }) => {
    setGlobalState((prev) => ({
      ...prev,
      anchorPosition: position,
    }));
  }, []);

  const setPopoverHeight = useCallback((height: number) => {
    setGlobalState((prev) => ({
      ...prev,
      popoverHeight: height,
    }));
  }, []);

  const setPopoverPosition = useCallback(
    (position: { top: number; left: number }) => {
      setGlobalState((prev) => ({
        ...prev,
        popoverPosition: position,
      }));
    },
    [],
  );

  const startScroll = useCallback(() => {
    setGlobalState((prev) => ({
      ...prev,
      isScrolling: true,
      isOpen: false,
    }));
  }, []);

  const endScroll = useCallback(() => {
    setGlobalState((prev) => ({
      ...prev,
      isScrolling: false,
    }));
  }, []);

  return (
    <SkillsPopoverContext.Provider
      value={{
        // Global popover
        activeNinja: globalState.activeNinja,
        anchorPosition: globalState.anchorPosition,
        popoverHeight: globalState.popoverHeight,
        popoverPosition: globalState.popoverPosition,
        isOpen: globalState.isOpen,
        isScrolling: globalState.isScrolling,
        isMobileDevice: deviceDetection.isMobileDevice,
        interactionMode: deviceDetection.interactionMode,
        openPopover,
        closePopover,
        updatePosition,
        setPopoverHeight,
        setPopoverPosition,
        startScroll,
        endScroll,

        // Portal
        portalContainer,
      }}
    >
      {children}
    </SkillsPopoverContext.Provider>
  );
}

// Export the getPortalContainer function for direct access if needed
export { getPortalContainer };
