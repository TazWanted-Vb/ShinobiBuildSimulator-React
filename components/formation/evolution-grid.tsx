"use client";

import { memo, useMemo } from "react";
import { EvolutionCell } from "./evolution-cell";
import {
  EvolutionPathType,
  SkillCategory,
  NinjaSkillEvolutions,
  SkillEvolutionVariant,
  EvolutionSelection,
  Ninja,
} from "@/lib/types";

interface EvolutionGridProps {
  evolutions: NinjaSkillEvolutions;
  selections: Record<SkillCategory, EvolutionSelection>;
  onPathSelect: (
    category: SkillCategory,
    path: EvolutionPathType,
    variantIndex: number,
  ) => void;
  ninja: Ninja;
  selectedPathGroup?: string | null; // For mobile tabs - filter to show only this path group
}

// Row configuration - maps categories to display labels
const ROWS: { category: SkillCategory; label: string }[] = [
  { category: "esoterico", label: "Esotérico" },
  { category: "combate", label: "Combate" },
  { category: "perseguição", label: "Perseguição" },
  { category: "passivo1", label: "Passivo" },
  { category: "passivo2", label: "Passivo" },
  { category: "passivo3", label: "Passivo" },
];

// Path groupings - which paths should be grouped together in one column
const PATH_GROUPINGS: Record<string, EvolutionPathType[]> = {
  original: ["original"],
  descoberta: ["descoberta"],
  mutacao_y: ["mutacao_y", "mutacao_y+1", "mutacao_y+2"],
  ligacao_l: ["ligacao_l", "ligacao_l+1", "ligacao_l+2", "ligacao_l+3"],
};

// Path order by rarity (weakest to strongest) for sorting variants within groups
const PATH_RARITY_ORDER: Record<EvolutionPathType, number> = {
  original: 1,
  descoberta: 2,
  mutacao_y: 3,
  "mutacao_y+1": 4,
  "mutacao_y+2": 5,
  ligacao_l: 6,
  "ligacao_l+1": 7,
  "ligacao_l+2": 8,
  "ligacao_l+3": 9,
};

// Column configuration - evolution path groups
const COLUMNS: {
  key: string;
  label: string;
  shortLabel: string;
  paths: EvolutionPathType[];
}[] = [
  { key: "original", label: "Original", shortLabel: "Original", paths: PATH_GROUPINGS.original },
  { key: "descoberta", label: "Descoberta", shortLabel: "Descoberta", paths: PATH_GROUPINGS.descoberta },
  { key: "mutacao_y", label: "Mutação Y", shortLabel: "Mut. Y", paths: PATH_GROUPINGS.mutacao_y },
  { key: "ligacao_l", label: "Ligação L", shortLabel: "Lig. L", paths: PATH_GROUPINGS.ligacao_l },
];

function EvolutionGridComponent({
  evolutions,
  selections,
  onPathSelect,
  ninja,
  selectedPathGroup,
}: EvolutionGridProps) {
  // Build a map of category -> path -> variants[] for quick lookup
  const pathGroupMap = useMemo(() => {
    const map = new Map<
      SkillCategory,
      Map<EvolutionPathType, SkillEvolutionVariant[]>
    >();
    evolutions.categories.forEach((cat) => {
      const pathMap = new Map<EvolutionPathType, SkillEvolutionVariant[]>();
      cat.pathGroups.forEach((pathGroup) => {
        pathMap.set(pathGroup.path, pathGroup.variants);
      });
      map.set(cat.category, pathMap);
    });
    return map;
  }, [evolutions]);

  // Filter columns based on selectedPathGroup (for mobile tabs)
  const visibleColumns = useMemo(() => {
    if (!selectedPathGroup) return COLUMNS;
    return COLUMNS.filter((col) => col.key === selectedPathGroup);
  }, [selectedPathGroup]);


  // Mobile vertical layout (when using tabs) vs Desktop grid layout
  const isMobileLayout = !!selectedPathGroup;

  return (
    <div className="flex flex-col gap-[1px] sm:gap-[2.6px]">
      {/* Column headers - only show in desktop grid layout */}
      {!isMobileLayout && (
        <div className="grid grid-cols-5 gap-[5.2px] px-1.5">
          <div className="text-[16.9px] text-neutral-400 font-semibold" />
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              className="text-[16.9px] text-neutral-300 font-semibold text-center py-1.5 bg-neutral-800/50 rounded border border-neutral-700 transition-colors hover:bg-neutral-800"
            >
              {col.shortLabel}
            </div>
          ))}
        </div>
      )}

      {/* Grid rows */}
      {ROWS.map((row) => {
        return (
          <div
            key={row.category}
            className={
              isMobileLayout
                ? "flex flex-col gap-2 px-1.5 py-2 border-b border-neutral-800 last:border-b-0"
                : "grid grid-cols-5 gap-[5.2px] items-start px-1.5"
            }
          >
            {/* Row label - positioned differently based on layout */}
            {isMobileLayout ? (
              <div className="text-sm text-neutral-300 font-semibold mb-1">
                {row.label}
              </div>
            ) : (
              <div className="text-[16.9px] text-neutral-400 font-semibold py-1.5 text-right pr-1.5">
                {row.label}
              </div>
            )}

            {/* Evolution path cells - variants displayed horizontally within each column */}
            {visibleColumns.map((col) => {
              const selectedPath = selections[row.category]?.path;
              const selectedVariantIndex = selections[row.category]?.variantIndex ?? 0;

              // Calculate how many slots this column should have
              // For single-path columns (Original, Descoberta): use max variants for that path
              // For multi-path columns (Mutação Y, Ligação L): use number of paths
              const getColumnSlotCount = () => {
                if (col.paths.length === 1) {
                  // Single path column - use max variants for this path
                  const path = col.paths[0];
                  const pathVariants = pathGroupMap.get(row.category)?.get(path) || [];
                  // Use actual variants count, capped at MAX_VARIANTS_PER_PATH from extractor
                  return Math.max(pathVariants.length, 1);
                } else {
                  // Multi-path column - one slot per path
                  return col.paths.length;
                }
              };

              const slotCount = getColumnSlotCount();

              return (
                <div
                  key={`${row.category}-${col.key}`}
                  className={`flex flex-row ${isMobileLayout ? "gap-2" : "gap-[2.6px]"}`}
                >
                  {col.paths.length === 1 ? (
                    // Single path column (Original, Descoberta)
                    // Show all variants for this path horizontally
                    Array.from({ length: slotCount }).map((_, idx) => {
                      const path = col.paths[0];
                      const pathVariants = pathGroupMap.get(row.category)?.get(path) || [];
                      const variant = pathVariants[idx] || null;

                      // Check if this specific variant is selected
                      // Use both path AND variantIndex since same path can have multiple variants
                      const isSelected = variant &&
                        variant.path === selectedPath &&
                        idx === selectedVariantIndex;

                      return (
                        <EvolutionCell
                          key={`${row.category}-${col.key}-${path}-${idx}`}
                          variant={variant}
                          path={path}
                          category={row.category}
                          ninja={ninja}
                          isSelected={isSelected || false}
                          isDisabled={!variant}
                          variantIndex={idx}
                          onClick={() => {
                            if (variant) {
                              // Use the array index as variantIndex for single-path columns
                              onPathSelect(row.category, path, idx);
                            }
                          }}
                        />
                      );
                    })
                  ) : (
                    // Multi-path column (Mutação Y, Ligação L)
                    // Show each path as one slot (showing first variant of that path)
                    col.paths.map((path, pathIdx) => {
                      const pathVariants = pathGroupMap.get(row.category)?.get(path) || [];
                      const variant = pathVariants.length > 0 ? pathVariants[0] : null;

                      // Check if this specific variant is selected
                      const isSelected = variant &&
                        variant.path === selectedPath &&
                        selectedVariantIndex === 0;

                      return (
                        <EvolutionCell
                          key={`${row.category}-${col.key}-${path}`}
                          variant={variant}
                          path={path}
                          category={row.category}
                          ninja={ninja}
                          isSelected={isSelected || false}
                          isDisabled={!variant}
                          variantIndex={0}
                          onClick={() => {
                            if (variant) {
                              onPathSelect(row.category, path, 0);
                            }
                          }}
                        />
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export const EvolutionGrid = memo(
  EvolutionGridComponent,
  (prevProps, nextProps) => {
    // Compare selections - compare path and variantIndex
    const prevSelectionsKeys = Object.entries(prevProps.selections)
      .map(([cat, sel]) => `${cat}:${sel.path}:${sel.variantIndex}`)
      .sort()
      .toString();
    const nextSelectionsKeys = Object.entries(nextProps.selections)
      .map(([cat, sel]) => `${cat}:${sel.path}:${sel.variantIndex}`)
      .sort()
      .toString();

    return (
      prevProps.evolutions.ninjaId === nextProps.evolutions.ninjaId &&
      prevSelectionsKeys === nextSelectionsKeys &&
      prevProps.selectedPathGroup === nextProps.selectedPathGroup
    );
  },
);

EvolutionGrid.displayName = "EvolutionGrid";
