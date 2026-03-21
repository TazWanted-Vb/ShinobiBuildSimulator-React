"use client";

import { memo } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { SkillEvolutionVariant, EvolutionPathType, SkillCategory, Ninja } from "@/lib/types";
import { SingleSkillHoverCard } from "./single-skill-hover-card";
import { getSkillImageUrl } from "@/lib/image-urls";
import { getPathMarkerLabel } from "@/lib/evolution-utils";

interface EvolutionCellProps {
  variant: SkillEvolutionVariant | null;
  path: EvolutionPathType;
  category: SkillCategory;
  ninja: Ninja;
  isSelected: boolean;
  isDisabled: boolean;
  variantIndex: number;
  onClick: () => void;
}

function EvolutionCellComponent({
  variant,
  path,
  category,
  ninja,
  isSelected,
  isDisabled,
  variantIndex,
  onClick,
}: EvolutionCellProps) {

  // Get display label for path
  const getPathLabel = (path: EvolutionPathType): string => {
    switch (path) {
      case "original":
        return "Original";
      case "descoberta":
        return "Descoberta";
      case "mutacao_y":
        return "Mutação (Y)";
      case "mutacao_y+1":
        return "Mutação (Y+1)";
      case "mutacao_y+2":
        return "Mutação (Y+2)";
      case "ligacao_l":
        return "Ligação (L)";
      case "ligacao_l+1":
        return "Ligação (L+1)";
      case "ligacao_l+2":
        return "Ligação (L+2)";
      case "ligacao_l+3":
        return "Ligação (L+3)";
      default:
        return path;
    }
  };

  const buttonContent = (
    <button
      onClick={onClick}
      disabled={isDisabled || !variant}
      className={cn(
        "relative flex items-center justify-center transition-all duration-200",
        "border-2 rounded-md",
        // Responsive sizes: 44px (mobile) → 43px (sm) → 46.8px (lg)
        "w-[44px] h-[44px] sm:w-[43px] sm:h-[43px] lg:w-[46.8px] lg:h-[46.8px]",
        // Selected state - orange border (app theme)
        isSelected && "border-orange-500",
        // Normal state
        !isSelected && "border-neutral-700 hover:border-neutral-500",
        // Disabled state
        (isDisabled || !variant) &&
          "opacity-30 cursor-not-allowed hover:border-neutral-700",
        !isDisabled &&
          variant &&
          "cursor-pointer hover:scale-105 active:scale-95",
      )}
      aria-label={
        variant
          ? `${getPathLabel(path)}: ${variant.skill.name}`
          : `${getPathLabel(path)}: Não disponível`
      }
      aria-pressed={isSelected}
      aria-disabled={isDisabled || !variant}
    >
      {/* Selected badge - responsive size */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="bg-orange-500 rounded-full p-0.5 shadow-lg">
            <Icon
              icon="solar:check-circle-bold"
              className="text-white w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] lg:w-[15.6px] lg:h-[15.6px]"
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Path marker badge - top-left corner - Minimalista */}
      {variant && (() => {
        const markerLabel = getPathMarkerLabel(path, variantIndex);
        if (!markerLabel) return null;

        return (
          <div className="absolute -top-1 -left-1 z-10">
            <div className="bg-orange-500 text-white text-[8px] sm:text-[9px] lg:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded shadow-md border border-orange-600">
              {markerLabel}
            </div>
          </div>
        );
      })()}

      {/* Skill icon - responsive size */}
      {variant ? (
        <img
          src={getSkillImageUrl(variant.skill.iconId)}
          alt={variant.skill.name}
          className="w-[33px] h-[33px] sm:w-[33px] sm:h-[33px] lg:w-[36.4px] lg:h-[36.4px] object-contain"
          loading="lazy"
        />
      ) : (
        <Icon
          icon="solar:forbidden-circle-linear"
          className="text-neutral-600 w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] lg:w-[26px] lg:h-[26px]"
        />
      )}
    </button>
  );

  // Wrap with hover card only if variant exists (has skill data)
  if (variant) {
    return (
      <SingleSkillHoverCard
        skill={variant.skill}
        ninja={ninja}
        skillCategory={category}
      >
        {buttonContent}
      </SingleSkillHoverCard>
    );
  }

  return buttonContent;
}

export const EvolutionCell = memo(
  EvolutionCellComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.variant?.skillId === nextProps.variant?.skillId &&
      prevProps.path === nextProps.path &&
      prevProps.category === nextProps.category &&
      prevProps.ninja.id === nextProps.ninja.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.variantIndex === nextProps.variantIndex
    );
  },
);

EvolutionCell.displayName = "EvolutionCell";
