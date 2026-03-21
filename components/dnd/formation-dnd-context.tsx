"use client";

import { useState, useCallback, createContext, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  CollisionDetection,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { NinjaDragOverlay } from "./ninja-drag-overlay";
import { Ninja } from "@/lib/types";

export const DragStateContext = createContext<{
  isDragging: boolean;
}>({
  isDragging: false,
});

interface FormationDndContextProps {
  children: React.ReactNode;
  onDragEnd: (ninjaId: number, targetSlotIndex: number, sourceSlotIndex?: number) => void;
  onDragStateChange?: (isDragging: boolean) => void;
  enabled?: boolean;
}

interface ActiveDragData {
  ninja: Ninja;
  type: "ninja" | "slot";
}

function parseSlotIndex(id: string): number | null {
  const match = id.match(/^(?:ninja-)?slot-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

function isRosterZone(id: string): boolean {
  return id === "roster-zone";
}

const optimizedCollisionDetection: CollisionDetection = (args) => {
  return rectIntersection(args);
};


export function FormationDndContext({
  children,
  onDragEnd,
  onDragStateChange,
  enabled = true,
}: FormationDndContextProps) {
  const [activeDragData, setActiveDragData] = useState<ActiveDragData | null>(null);
  const [isAnyDragging, setIsAnyDragging] = useState(false);

  useEffect(() => {
    onDragStateChange?.(isAnyDragging);
  }, [isAnyDragging, onDragStateChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: enabled ? 8 : 9999,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current as {
      ninja?: Ninja;
      type?: "ninja" | "slot";
    } | null;

    setIsAnyDragging(true);

    if (activeData?.ninja) {
      setActiveDragData({
        ninja: activeData.ninja,
        type: activeData.type || "ninja",
      });
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current as {
      ninja?: Ninja;
      type?: "ninja" | "slot";
      slotIndex?: number;
    } | null;

    setIsAnyDragging(false);
    setActiveDragData(null);

    if (!activeData || !activeData.ninja) {
      return;
    }

    const ninjaId = activeData.ninja.id;

    if (!over) {
      // Dropped outside - cancel drag, do nothing (ninja stays in place)
      return;
    }

    // Check if dropped in roster zone (remove ninja from formation)
    if (isRosterZone(over.id as string)) {
      if (activeData.type === "slot" && activeData.slotIndex !== undefined) {
        onDragEnd(ninjaId, -1, activeData.slotIndex);
      }
      return;
    }

    const targetSlotIndex = parseSlotIndex(over.id as string);
    if (targetSlotIndex === null) {
      return;
    }

    let sourceSlotIndex: number | undefined;
    if (activeData.type === "slot" && activeData.slotIndex !== undefined) {
      sourceSlotIndex = activeData.slotIndex;
    }

    onDragEnd(ninjaId, targetSlotIndex, sourceSlotIndex);
  }, [onDragEnd]);

  // Optimize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isDragging: isAnyDragging
  }), [isAnyDragging]);

  return (
    <DragStateContext.Provider value={contextValue}>
      <DndContext
        id="formation-dnd-context"
        sensors={sensors}
        collisionDetection={optimizedCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapCenterToCursor]}
      >
        {children}

        <DragOverlay dropAnimation={null}>
          {activeDragData && <NinjaDragOverlay ninja={activeDragData.ninja} />}
        </DragOverlay>
      </DndContext>
    </DragStateContext.Provider>
  );
}
