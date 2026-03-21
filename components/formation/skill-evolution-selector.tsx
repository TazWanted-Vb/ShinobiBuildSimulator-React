"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { EvolutionGrid } from "./evolution-grid";
import {
  Ninja,
  EvolutionPathType,
  SkillCategory,
  EvolutionSelection,
} from "@/lib/types";
import { useFormationActions } from "@/components/providers/formation-provider";

// Path groups for mobile tabs
const PATH_GROUPS = [
  { key: "original", label: "Original", shortLabel: "Original" },
  { key: "descoberta", label: "Descoberta", shortLabel: "Descoberta" },
  { key: "mutacao_y", label: "Mutação Y", shortLabel: "Mut. Y" },
  { key: "ligacao_l", label: "Ligação L", shortLabel: "Lig. L" },
];

interface SkillEvolutionSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ninja: Ninja;
}

function SkillEvolutionSelectorComponent({
  open,
  onOpenChange,
  ninja,
}: SkillEvolutionSelectorProps) {
  const { setEvolutionPath, getEvolutionSelections } = useFormationActions();
  const contentRef = useRef<HTMLDivElement>(null);

  // Mobile-only tab state - doesn't affect desktop
  const [mobileTab, setMobileTab] = useState<string>("original");

  // Reset to first tab when modal opens
  useEffect(() => {
    if (open) {
      setMobileTab("original");
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Get current selections for this ninja
  const getCurrentSelections = useCallback(
    (): Record<SkillCategory, EvolutionSelection> => {
      const allSelections = getEvolutionSelections();
      return (
        allSelections.get(ninja.id) || {
          esoterico: { path: "original", variantIndex: 0, skillId: "" },
          combate: { path: "original", variantIndex: 0, skillId: "" },
          perseguição: { path: "original", variantIndex: 0, skillId: "" },
          passivo1: { path: "original", variantIndex: 0, skillId: "" },
          passivo2: { path: "original", variantIndex: 0, skillId: "" },
          passivo3: { path: "original", variantIndex: 0, skillId: "" },
        }
      );
    },
    [ninja.id, getEvolutionSelections],
  );

  // Helper to get skillId for a specific category, path, and variant index
  const getSkillIdForVariant = useCallback(
    (category: SkillCategory, path: EvolutionPathType, variantIndex: number): string => {
      if (!ninja.skillEvolutions) return "";
      const categoryEvolution = ninja.skillEvolutions.categories.find(
        (c) => c.category === category,
      );
      if (!categoryEvolution) return "";
      const pathGroup = categoryEvolution.pathGroups.find(
        (pg) => pg.path === path,
      );
      if (!pathGroup || !pathGroup.variants[variantIndex]) return "";
      return pathGroup.variants[variantIndex].skillId;
    },
    [ninja.skillEvolutions],
  );

  // Handle path selection
  const handlePathSelect = useCallback(
    (category: SkillCategory, path: EvolutionPathType, variantIndex: number) => {
      const skillId = getSkillIdForVariant(category, path, variantIndex);
      setEvolutionPath(ninja.id, category, path, variantIndex, skillId);
    },
    [ninja.id, setEvolutionPath, getSkillIdForVariant],
  );

  // Handle close
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  if (!open) return null;

  const hasEvolutions =
    ninja.skillEvolutions && ninja.skillEvolutions.hasEvolutions;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={contentRef}
        className={`bg-black rounded-lg w-[95vw] sm:w-[90vw] lg:w-fit max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-800`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — same pattern as ItemModal */}
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 border-b border-neutral-800">
          <h3 className="text-white text-base sm:text-lg font-medium">
            Evolução de Habilidades
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 sm:p-1.5 rounded hover:bg-neutral-800 transition-colors"
          >
            <Icon
              icon="solar:close-circle-linear"
              className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400"
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-4 overflow-y-auto max-h-[calc(90vh-70px)]">
          {!hasEvolutions ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icon
                icon="solar:forbidden-circle-linear"
                className="text-neutral-600 w-16 h-16 mb-4"
              />
              <h3 className="text-xl font-semibold text-neutral-300 mb-2">
                Sem evoluções disponíveis
              </h3>
              <p className="text-sm text-neutral-500">
                Este ninja não possui evoluções de habilidades disponíveis no
                momento.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Mobile tabs - only visible on small screens */}
              <div className="lg:hidden flex flex-wrap gap-2 px-2 sm:px-3">
                {PATH_GROUPS.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setMobileTab(group.key)}
                    className={`
                      px-3 py-1.5 rounded-md font-medium text-sm transition-all
                      ${mobileTab === group.key
                        ? "bg-orange-500 text-white shadow-lg"
                        : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300"
                      }
                    `}
                  >
                    {group.shortLabel}
                  </button>
                ))}
              </div>

              {/* Evolution grid - responsive grid, no horizontal scroll */}
              <div className="p-2 sm:p-3 lg:p-4">
                {/* Mobile version - with tab filtering */}
                <div className="lg:hidden">
                  <EvolutionGrid
                    evolutions={ninja.skillEvolutions!}
                    selections={getCurrentSelections()}
                    onPathSelect={handlePathSelect}
                    ninja={ninja}
                    selectedPathGroup={mobileTab}
                  />
                </div>
                {/* Desktop version - full grid */}
                <div className="hidden lg:block">
                  <EvolutionGrid
                    evolutions={ninja.skillEvolutions!}
                    selections={getCurrentSelections()}
                    onPathSelect={handlePathSelect}
                    ninja={ninja}
                    selectedPathGroup={null}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const SkillEvolutionSelector = memo(
  SkillEvolutionSelectorComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.open === nextProps.open &&
      prevProps.ninja.id === nextProps.ninja.id &&
      prevProps.ninja.skillEvolutions?.hasEvolutions ===
        nextProps.ninja.skillEvolutions?.hasEvolutions
    );
  },
);

SkillEvolutionSelector.displayName = "SkillEvolutionSelector";
