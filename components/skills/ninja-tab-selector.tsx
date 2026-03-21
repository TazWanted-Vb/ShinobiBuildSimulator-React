"use client";

import React, { useCallback } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import type { FormationSlotWithOrder } from "@/lib/types";
import { ELEMENT_ICONS } from "@/lib/data";

interface NinjaTabSelectorProps {
  formationWithOrder: FormationSlotWithOrder[];
  selectedNinjaId: number | null;
  onSelectNinja: (id: number | null) => void;
  showAllOption?: boolean;
}

export const NinjaTabSelector = React.memo(function NinjaTabSelector({
  formationWithOrder,
  selectedNinjaId,
  onSelectNinja,
  showAllOption = true,
}: NinjaTabSelectorProps) {
  if (formationWithOrder.length === 0) {
    return null;
  }

  const isShowAllActive = selectedNinjaId === null;

  // Memoize handlers to prevent re-renders
  const handleSelectAll = useCallback(() => onSelectNinja(null), [onSelectNinja]);

  const handleSelectNinja = useCallback((ninjaId: number, isActive: boolean) => {
    if (isActive && !showAllOption) return;
    onSelectNinja(isActive ? null : ninjaId);
  }, [onSelectNinja, showAllOption]);

  return (
    <div
      className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide"
      role="tablist"
      aria-label="Seletor de ninjas"
    >
      {/* "Show All" Tab */}
      {showAllOption && (
        <button
          onClick={handleSelectAll}
          className={cn(
            "flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-xl border-2 transition-all duration-200 flex items-center justify-center relative overflow-hidden group",
            isShowAllActive
              ? "border-orange-500 bg-neutral-800 shadow-lg shadow-orange-500/20"
              : "border-neutral-700 bg-neutral-900 hover:border-neutral-600"
          )}
          role="tab"
          aria-selected={isShowAllActive}
          aria-label="Ver todos os ninjas"
          title="Ver todos os ninjas"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 to-neutral-950/80" />
          <Icon
            icon="solar:users-group-rounded-linear"
            className={cn(
              "relative z-10 transition-colors",
              isShowAllActive ? "text-orange-400" : "text-neutral-500 group-hover:text-neutral-400"
            )}
            width={32}
            strokeWidth={1.5}
          />
        </button>
      )}

      {/* Ninja Avatar Tabs */}
      {formationWithOrder.map(({ ninja, order }) => {
        const isActive = selectedNinjaId === ninja.id;

        return (
          <button
            key={ninja.id}
            onClick={() => handleSelectNinja(ninja.id, isActive)}
            className={cn(
              "flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-xl border-2 transition-all duration-200 overflow-hidden relative",
              isActive
                ? "border-orange-500 shadow-lg shadow-orange-500/20"
                : "border-neutral-700 hover:border-neutral-600"
            )}
            role="tab"
            aria-selected={isActive}
            aria-label={`Ver habilidades de ${ninja.name}`}
            title={`${ninja.name} (Slot ${order})`}
          >
            {/* Background Image - positioned to show face on left */}
            <div className="absolute inset-0 bg-neutral-900">
              <img
                src={ninja.img}
                alt={ninja.name}
                className="object-cover object-left w-full h-full"
              />
            </div>

            {/* Gradient overlay */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-t",
              isActive
                ? "from-orange-900/60 via-neutral-900/40 to-transparent"
                : "from-neutral-900/80 via-neutral-900/40 to-transparent"
            )} />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full justify-between p-1.5">
              {/* Top: Slot number */}
              <div className="flex justify-between items-start">
                <div className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-orange-500 text-white"
                    : "bg-neutral-700/80 text-neutral-300"
                )}>
                  {order}
                </div>
                {/* Element icon */}
                <Icon
                  icon={ELEMENT_ICONS[ninja.element]}
                  className={cn(
                    "text-xs drop-shadow-md",
                    isActive ? "text-white/90" : "text-neutral-400/80"
                  )}
                />
              </div>

              {/* Bottom: Power and Name */}
              <div className="space-y-0.5">
                <div className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded backdrop-blur-sm",
                  isActive
                    ? "bg-orange-500/80"
                    : "bg-neutral-800/80"
                )}>
                  <Icon icon="solar:lightning-bold" className="text-[8px] text-yellow-400" />
                  <span className="text-[9px] font-bold text-white tabular-nums">
                    {ninja.power}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-white truncate drop-shadow-lg px-0.5">
                  {ninja.name}
                </p>
              </div>
            </div>

            {/* Selected indicator */}
            {isActive && (
              <div className="absolute top-1 right-1 z-20">
                <div className="bg-orange-500 rounded-full p-0.5 shadow-lg">
                  <Icon
                    icon="solar:check-circle-bold"
                    className="text-white w-3 h-3"
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});
