"use client";

import { useDraggable } from "@dnd-kit/core";
import { Ninja } from "@/lib/types";
import { preloadImageWithCache } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDragState } from "@/components/providers/formation-provider";
import { useEffect, memo } from "react";

interface DraggableNinjaCardProps {
  ninja: Ninja;
  isUsed: boolean;
  isSelected?: boolean;
  children: React.ReactNode;
  disableOnMobile?: boolean;
}

export const DraggableNinjaCard = memo(function DraggableNinjaCard({
  ninja,
  isUsed,
  isSelected = false,
  children,
  disableOnMobile = false,
}: DraggableNinjaCardProps) {
  const isDesktop = useMediaQuery("(hover: hover)");
  const { evolutionDialogOpen } = useDragState();

  const shouldDisableDrag = isUsed || isSelected || evolutionDialogOpen || (disableOnMobile && !isDesktop);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `ninja-${ninja.id}`,
    data: {
      type: "ninja",
      ninjaId: ninja.id,
      ninja,
    },
    disabled: shouldDisableDrag,
  });

  useEffect(() => {
    if (ninja.display && isDesktop) {
      const preloadTimer = setTimeout(() => {
        preloadImageWithCache(ninja.display);
      }, 100);
      return () => clearTimeout(preloadTimer);
    }
  }, [ninja.display, isDesktop]);

  return (
    <div
      ref={setNodeRef}
      {...(!shouldDisableDrag && listeners)}
      {...(!shouldDisableDrag && attributes)}
      style={{
        opacity: isDragging ? 0 : 1,
        transition: isDragging ? 'none' : 'opacity 200ms ease-out',
        touchAction: isDragging ? 'none' : 'pan-y',
        overscrollBehavior: isDragging ? 'contain' : 'auto',
        willChange: isDragging ? 'transform' : 'auto',
      }}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
});
