import { useRef, memo, useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { useDraggable } from "@dnd-kit/core";
import { FormationSlot as NinjaSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NinjaSkillsPopover } from "@/components/formation/ninja-skills-popover";
import {
  isImageLoaded as checkImageLoaded,
  markImageAsLoaded,
} from "@/lib/image-cache";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSkillsPopover } from "@/components/formation/skills-popover-context";
import { useDragState } from "@/components/providers/formation-provider";
import { Icon } from "@iconify/react";

interface NinjaFormationCardProps {
  ninja: NonNullable<NinjaSlot>;
  scale: number;
  slotIndex?: number;
  zIndex?: number;
}

export const NinjaFormationCard = memo(
  function NinjaFormationCard({
    ninja,
    scale,
    slotIndex,
    zIndex,
  }: NinjaFormationCardProps) {
    const imgRef = useRef<HTMLImageElement>(null);
    const imageLoadedRef = useRef(checkImageLoaded(ninja.display));
    const isDesktop = useMediaQuery("(hover: hover)");
    const { openPopover, closePopover, isOpen } = useSkillsPopover();
    const { isDragEnabled } = useDragState();
    const [showSkillsPopover, setShowSkillsPopover] = useState(false);

    // Unified click handler for the card (called from NinjaSkillsPopover wrapper)
    const handleSkillsPopoverOpen = useCallback(() => {
      if (!isDesktop && !isDragEnabled) {
        // Toggle skills popover when drag is disabled
        setShowSkillsPopover(prev => !prev);
      }
    }, [isDesktop, isDragEnabled]);

    // Handle skills popover open/close
    useEffect(() => {
      if (!isDesktop && !isDragEnabled) {
        if (showSkillsPopover) {
          // Get card position for popover
          const card = document.querySelector(
            `[data-ninja-formation-card="${slotIndex}"]`,
          ) as HTMLElement;
          if (card) {
            const rect = card.getBoundingClientRect();
            openPopover(ninja, {
              x: rect.left + rect.width / 2,
              y: rect.top,
            });
          }
        } else {
          closePopover();
        }
      }
    }, [showSkillsPopover, isDesktop, isDragEnabled, slotIndex, ninja, openPopover, closePopover]);

    // Close popover when card is unmounted
    useEffect(() => {
      return () => {
        if (!isDesktop && !isDragEnabled && isOpen) {
          closePopover();
        }
      };
    }, [isDesktop, isDragEnabled, isOpen, closePopover]);

    // Reset image loaded state when ninja changes to different URL
    useEffect(() => {
      imageLoadedRef.current = checkImageLoaded(ninja.display);
    }, [ninja.display]);

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `ninja-slot-${slotIndex}`,
      data: {
        type: "slot",
        ninjaId: ninja.id,
        ninja,
        slotIndex,
      },
      disabled: !isDragEnabled,
    });

    return (
      <NinjaSkillsPopover ninja={ninja} onOpenClick={handleSkillsPopoverOpen}>
        <div
          data-ninja-formation-card={slotIndex}
          className={cn(
            "absolute inset-0 flex items-center justify-center select-none overflow-visible",
            !isDragging && "group",
            isDragging ? "opacity-30 z-0" : "",
            !isDragging && "transition-all duration-300 ease-out",
            isDragging && "transition-none",
            !isDragEnabled && !isDesktop && "cursor-pointer",
          )}
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            zIndex: isDragging ? 0 : zIndex,
            willChange: isDragging ? "transform" : "auto",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              marginTop: "-35px",
              marginBottom: "-110px",
              marginLeft: "-20px",
              marginRight: "-20px",
              pointerEvents: "auto",
              zIndex: -1,
            }}
            data-hitbox="true"
            aria-hidden="true"
          />

          <Image
            ref={imgRef as React.RefObject<HTMLImageElement>}
            src={ninja.display}
            alt={ninja.name}
            draggable={false}
            width={200}
            height={200}
            quality={85}
            priority={false}
            className={cn(
              "absolute z-10 w-auto top-[-20px] left-1/2 -translate-x-1/2 drop-shadow-xl pointer-events-none transition-opacity duration-300",
              !isDragging && "group-hover:scale-110",
              !isDragging && "transition-all duration-300 ease-out",
              isDragging && "transition-none",
              imageLoadedRef.current ? "opacity-100" : "opacity-0",
            )}
            style={{
              height: "52.5px",
              bottom: "5px",
              transform: `scale(${scale})`,
              transformOrigin: "bottom center",
            }}
            onLoad={() => {
              markImageAsLoaded(ninja.display);
              imageLoadedRef.current = true;
            }}
          />
          {!imageLoadedRef.current && !isDragging && (
            <div
              className="absolute z-10 w-auto top-[-20px] left-1/2 -translate-x-1/2 pointer-events-none bg-neutral-800/30 rounded-full"
              style={{
                height: "52.5px",
                bottom: "5px",
                width: "52.5px",
                transform: `scale(${scale})`,
                transformOrigin: "bottom center",
              }}
            />
          )}

          <img
            src="/slot-base.png"
            width={300}
            height={300}
            draggable={false}
            style={{ opacity: 0.85, width: "90%", height: "90%" }}
            alt="slot background"
            className="absolute top-[3px] left-1/2 -translate-x-1/2 -ml-[2px] w-full h-full object-contain pointer-events-none z-0"
          />

          <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            role="button"
            tabIndex={0}
            aria-roledescription="Arrastável ninja na formação"
            aria-label={`${ninja.name} - ${ninja.career} - ${ninja.element}`}
            style={{
              pointerEvents: "auto",
              touchAction: "none",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
            }}
          />
        </div>
      </NinjaSkillsPopover>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: use reference equality for ninja (faster and more accurate)
    // Only re-render if ninja reference, slotIndex, zIndex, or scale changes
    return (
      prevProps.ninja === nextProps.ninja &&
      prevProps.slotIndex === nextProps.slotIndex &&
      prevProps.zIndex === nextProps.zIndex &&
      prevProps.scale === nextProps.scale
    );
  },
);
