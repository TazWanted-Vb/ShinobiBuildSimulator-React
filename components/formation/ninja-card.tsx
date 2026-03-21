import { useRef, memo, useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useTranslatedTypes } from "@/lib/i18n-helpers";
import { Ninja } from "@/lib/types";
import { ELEMENT_ICONS } from "@/lib/data";
import { cn, preloadImageWithCache } from "@/lib/utils";
import { DraggableNinjaCard } from "@/components/dnd/draggable-ninja-card";
import {
  useFormationActions,
  useDragState,
} from "@/components/providers/formation-provider";
import { NinjaSkillsPopover } from "@/components/formation/ninja-skills-popover";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  isImageLoaded as checkImageLoaded,
  markImageAsLoaded,
} from "@/lib/image-cache";
import { SkillEvolutionSelector } from "@/components/formation/skill-evolution-selector";
import { useSkillsPopover } from "@/components/formation/skills-popover-context";

interface NinjaCardProps {
  ninja: Ninja;
  isSelected: boolean;
  isUsed: boolean;
  onSelect: (id: number) => void;
}

function NinjaCardComponent({
  ninja,
  isSelected,
  isUsed,
  onSelect,
}: NinjaCardProps) {
  const t = useTranslations("ninjaCard");
  const { translateElement, translateCareer } = useTranslatedTypes();
  const imgRef = useRef<HTMLImageElement>(null);
  const isDesktop = useMediaQuery("(hover: hover)");
  const { placeNinjaInFirstEmptySlot } = useFormationActions();
  const { isDragging, setEvolutionDialogOpen, isDragEnabled } = useDragState();
  const { openPopover, closePopover, isOpen } = useSkillsPopover();
  const didDragRef = useRef(false);
  const [isImageLoaded, setIsImageLoaded] = useState(
    checkImageLoaded(ninja.img),
  );
  const [showEvolutionSelector, setShowEvolutionSelector] = useState(false);
  const [showSkillsPopover, setShowSkillsPopover] = useState(false);

  // Check if ninja has evolutions
  const hasEvolutions = ninja.skillEvolutions?.hasEvolutions;

  const handleMouseEnter = useCallback(() => {
    if (ninja.display) {
      preloadImageWithCache(ninja.display);
    }
  }, [ninja.display]);

  // Unified click handler for the card
  const handleSkillsPopoverOpen = useCallback(() => {
    if (isDragging || didDragRef.current) {
      return;
    }

    // Check if drag is disabled (same logic as DraggableNinjaCard)
    const dragDisabled = isUsed || isSelected || showEvolutionSelector;

    if (!isDesktop) {
      // On mobile:
      // - If formation is locked: open skills popover
      // - If drag is blocked (used/selected): open skills popover
      // - Otherwise: place ninja in grid
      if (!isDragEnabled || dragDisabled) {
        setShowSkillsPopover(prev => !prev);
      } else {
        placeNinjaInFirstEmptySlot(ninja.id);
      }
    } else {
      // On desktop, only select if not used
      if (!isUsed) {
        onSelect(ninja.id);
      }
    }
  }, [
    isDragging,
    isUsed,
    isSelected,
    showEvolutionSelector,
    isDesktop,
    isDragEnabled,
    placeNinjaInFirstEmptySlot,
    onSelect,
    ninja.id,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isUsed) onSelect(ninja.id);
      }
    },
    [isUsed, onSelect, ninja.id],
  );

  const handleMouseDown = useCallback(() => {
    didDragRef.current = false;
  }, []);

  const handleMouseMove = useCallback(() => {
    didDragRef.current = true;
  }, []);

  const handlePointerDown = useCallback(() => {
    if (isDesktop) {
      didDragRef.current = false;
    }
  }, [isDesktop]);

  const handleEvolutionClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      didDragRef.current = false;
      setShowEvolutionSelector(true);
    },
    [],
  );

  const handleEvolutionPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      didDragRef.current = false;
    },
    [],
  );

  // Memoize star icons to prevent recreation on every render
  const starIcons = useMemo(
    () =>
      Array.from({ length: ninja.star }).map((_, i) => (
        <Icon
          key={i}
          icon="solar:star-bold"
          className="text-yellow-500 text-[10px] sm:text-[10px] drop-shadow-md"
          aria-hidden="true"
        />
      )),
    [ninja.star],
  );

  useEffect(() => {
    setIsImageLoaded(checkImageLoaded(ninja.img));
  }, [ninja.img]);

  useEffect(() => {
    if (!isDragging) {
      const timer = setTimeout(() => {
        didDragRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  // Update global evolution dialog state when this dialog opens/closes
  useEffect(() => {
    setEvolutionDialogOpen(showEvolutionSelector);
  }, [showEvolutionSelector, setEvolutionDialogOpen]);

  // Handle skills popover open/close on mobile
  useEffect(() => {
    if (!isDesktop) {
      if (showSkillsPopover) {
        // Open popover centered on screen for mobile
        openPopover(ninja, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
      } else {
        closePopover();
      }
    }
  }, [showSkillsPopover, isDesktop, ninja, openPopover, closePopover]);

  // Close skills popover when this ninja's card is unmounted
  useEffect(() => {
    return () => {
      if (!isDesktop && isOpen) {
        closePopover();
      }
    };
  }, [isDesktop, isOpen, closePopover]);

  return (
    <div className="relative">
      <DraggableNinjaCard
        ninja={ninja}
        isUsed={isUsed}
        isSelected={isSelected}
        disableOnMobile={false}
      >
        <NinjaSkillsPopover ninja={ninja} onOpenClick={handleSkillsPopoverOpen}>
          <div
            onMouseEnter={isDesktop ? handleMouseEnter : undefined}
            onMouseDown={isDesktop ? handleMouseDown : undefined}
            onMouseMove={isDesktop ? handleMouseMove : undefined}
            onPointerDown={handlePointerDown}
            className={cn(
              "relative flex items-center justify-center rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black overflow-hidden h-[95px] md:h-[90px] select-none",
              "border-neutral-800 hover:border-neutral-700 cursor-pointer",
              isUsed && "opacity-40",
            )}
            role="button"
            tabIndex={0}
            aria-pressed={false}
            aria-disabled={isUsed}
            aria-label={
              t("select", {
                name: ninja.name,
                role: translateCareer(ninja.career),
                element: translateElement(ninja.element),
                power: ninja.power,
              }) + (isUsed ? t("alreadyUsed") : "")
            }
            onKeyDown={handleKeyDown}
          >
            <div className="absolute inset-y-0 left-0 w-[180px] sm:w-[200px] md:w-[220px] h-full">
              <Image
                ref={imgRef as React.RefObject<HTMLImageElement>}
                src={ninja.img}
                alt={ninja.name}
                draggable={false}
                fill
                sizes="(max-width: 640px) 180px, (max-width: 768px) 200px, 220px"
                quality={85}
                className={cn(
                  "object-cover transition-opacity duration-300",
                  isImageLoaded ? "opacity-100" : "opacity-0",
                )}
                onLoad={() => {
                  markImageAsLoaded(ninja.img);
                  setIsImageLoaded(true);
                }}
              />
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/50 to-neutral-950" />
            </div>

            <div className="relative z-10 flex-1 ml-[90px] sm:ml-[100px] md:ml-[110px] pl-3 pr-2 min-w-0 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-0.5">
                <h4 className="text-sm sm:text-sm font-semibold text-white truncate tracking-tight drop-shadow-lg">
                  {ninja.nameDisplay}
                </h4>
                <div
                  className="flex items-center gap-0.5 shrink-0 sm:ml-auto"
                  aria-label={t("stars", { count: ninja.star })}
                >
                  {starIcons}
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 mb-0.5">
                <div className="flex items-center gap-1 bg-neutral-950/80 px-2 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white tabular-nums backdrop-blur-sm border border-neutral-700">
                  <Icon
                    icon="solar:lightning-bold"
                    className="text-[10px] sm:text-[10px] text-orange-500"
                  />
                  {ninja.power}
                </div>
                <div className="flex items-center gap-1 flex">
                  <Icon
                    icon={ELEMENT_ICONS[ninja.element]}
                    className="text-xs sm:text-sm"
                  />
                  <span className="text-[8px] sm:text-[10px] text-neutral-300">
                    {ninja.village}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] sm:text-[10px] text-neutral-400 drop-shadow-md">
                <span className="text-red-400">⚔{ninja.stats.ninjaAtk[1]}</span>
                <span className="text-blue-400">
                  🛡{ninja.stats.ninjaDef[1]}
                </span>
                <span className="text-green-400">♥{ninja.stats.life[1]}</span>
              </div>
            </div>
          </div>
        </NinjaSkillsPopover>

        {/* Evolution edit button - same style and position on all devices */}
        {hasEvolutions && (
          <button
            onClick={handleEvolutionClick}
            onPointerDown={handleEvolutionPointerDown}
            className="absolute bottom-1 right-1 z-50 p-2.5
                     hover:scale-125 active:scale-100
                     transition-all duration-200"
            aria-label="Evoluir habilidades"
          >
            <Icon
              icon="mdi:shuriken"
              className="text-neutral-300 text-2xl hover:text-orange-500 transition-colors duration-200 drop-shadow-md"
            />
          </button>
        )}

        {/* Evolution selector dialog */}
        <SkillEvolutionSelector
          open={showEvolutionSelector}
          onOpenChange={setShowEvolutionSelector}
          ninja={ninja}
        />
      </DraggableNinjaCard>
    </div>
  );
}

export const NinjaCard = memo(NinjaCardComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return (
    prevProps.ninja.id === nextProps.ninja.id &&
    prevProps.ninja.name === nextProps.ninja.name &&
    prevProps.ninja.power === nextProps.ninja.power &&
    prevProps.ninja.star === nextProps.ninja.star &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isUsed === nextProps.isUsed
  );
});
NinjaCard.displayName = "NinjaCard";
