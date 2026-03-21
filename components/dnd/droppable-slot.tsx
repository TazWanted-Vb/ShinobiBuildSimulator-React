"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface DroppableSlotProps {
  slotIndex: number;
  children: React.ReactNode;
  className?: string;
}

export const DroppableSlot = memo(function DroppableSlot({
  slotIndex,
  children,
  className,
}: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotIndex}`,
    data: {
      type: "slot",
      slotIndex,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver && "formation-slot-dragover"
      )}
      style={{
        padding: '8px',
        margin: '-8px',
      }}
    >
      {children}
    </div>
  );
});
