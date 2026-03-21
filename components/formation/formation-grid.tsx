"use client";

import { type FormationSlot, FormationSlotWithOrder } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NinjaFormationCard } from "./ninja-formation-card";
import { SlotOrderBadge } from "./slot-order-badge";
import {
  FormationLayoutConfig,
  getLayoutConfig,
  FormationSlotConfig,
} from "@/lib/formation-layout";
import { DroppableSlot } from "@/components/dnd/droppable-slot";
import { memo, useMemo, useState, useEffect } from "react";
import { useDynamicFormationData } from "@/components/providers/formation-provider";

interface FormationSlotProps {
  slotData: { ninja: FormationSlot | null; slotIndex: number };
  slotConfig: FormationSlotConfig;
  order?: number;
  onSlotClick: () => void;
}

// Memoized slot component to prevent unnecessary re-renders
// Only re-renders when its specific slot data or order changes
const FormationSlot = memo(function FormationSlot({
  slotData,
  slotConfig,
  order,
  onSlotClick,
}: FormationSlotProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        position: "absolute",
        left: slotConfig.x,
        top: slotConfig.y,
        width: slotConfig.width,
        height: slotConfig.height,
        zIndex: slotConfig.zIndex ?? 0,
      }}
    >
      <DroppableSlot
        slotIndex={slotData.slotIndex}
        className={cn(
          !slotData.ninja && "bg-black/20",
          slotData.ninja && "bg-black/40",
        )}
      >
        <div
          onClick={onSlotClick}
          role="button"
          tabIndex={0}
          aria-label={
            slotData.ninja
              ? `Slot ${slotData.slotIndex + 1}: ${slotData.ninja.name}`
              : `Slot ${slotData.slotIndex + 1} vazio`
          }
          aria-roledescription="Slot de formação"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            userSelect: 'none',
          }}
        >
        </div>
      </DroppableSlot>

      {slotData.ninja && (
        <>
          <NinjaFormationCard
            key={slotData.ninja.id}
            ninja={slotData.ninja}
            scale={4.25}
            slotIndex={slotData.slotIndex}
            zIndex={slotConfig.zIndex ?? 0}
          />
          {order !== undefined && (
            <SlotOrderBadge order={order} />
          )}
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for FormationSlot
  // Only re-render if slot content actually changed
  // Don't compare slotConfig by reference - compare individual properties
  const ninjaChanged = prevProps.slotData.ninja !== nextProps.slotData.ninja;
  const slotIndexChanged = prevProps.slotData.slotIndex !== nextProps.slotData.slotIndex;
  const orderChanged = prevProps.order !== nextProps.order;

  // Slot config properties that matter for rendering
  const configChanged =
    prevProps.slotConfig.x !== nextProps.slotConfig.x ||
    prevProps.slotConfig.y !== nextProps.slotConfig.y ||
    prevProps.slotConfig.width !== nextProps.slotConfig.width ||
    prevProps.slotConfig.height !== nextProps.slotConfig.height ||
    prevProps.slotConfig.zIndex !== nextProps.slotConfig.zIndex;

  return !ninjaChanged && !slotIndexChanged && !orderChanged && !configChanged;
});

interface FormationGridProps {
  formationWithOrder: FormationSlotWithOrder[];
  onSlotClick: (index: number) => void;
  layoutConfig?: Partial<FormationLayoutConfig>;
}

export const FormationGrid = memo(function FormationGrid({
  formationWithOrder,
  onSlotClick,
  layoutConfig,
}: FormationGridProps) {
  // Get formation data from dynamic context
  const { formation } = useDynamicFormationData();

  // Create array of slot data with useMemo for stability
  const slotsData = useMemo(() =>
    formation.map((ninja, slotIndex) => ({ ninja, slotIndex })),
    [formation]
  );
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const orderMap = useMemo(() =>
    new Map(formationWithOrder.map(o => [o.slotIndex, o.order])),
    [formationWithOrder]
  );

  const layout = useMemo(() =>
    getLayoutConfig(layoutConfig, isDesktop),
    [layoutConfig, isDesktop]
  );

  // Memoize all slot configs to prevent object creation on every render
  const slotConfigs = useMemo(() => {
    const configs = [];
    for (let i = 0; i < 9; i++) {
      const slotKey = `slot${i + 1}` as keyof FormationLayoutConfig["slots"];
      configs.push(layout.slots[slotKey]);
    }
    return configs;
  }, [layout]);

  const slotClickHandlers = useMemo(() =>
    Array.from({ length: 9 }, (_, index) => () => onSlotClick(index)),
    [onSlotClick]
  );

  return (
    <div
      className="relative mx-auto flex-shrink-0 overflow-visible select-none"
      style={{
        width: layout.containerWidth,
        height: layout.containerHeight,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: "url('/Adobe Express - file.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />

      {slotsData.map((slotData) => (
        <FormationSlot
          key={`slot-${slotData.slotIndex}`}
          slotData={slotData}
          slotConfig={slotConfigs[slotData.slotIndex]}
          order={orderMap.get(slotData.slotIndex)}
          onSlotClick={slotClickHandlers[slotData.slotIndex]}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  const prevFormation = prevProps.formationWithOrder;
  const nextFormation = nextProps.formationWithOrder;

  // Quick length check
  if (prevFormation.length !== nextFormation.length) return false;

  // Check if formation is exactly the same (ninja, slotIndex, and order)
  // Isso garante que detectamos quando ninjas trocam de posição
  for (let i = 0; i < prevFormation.length; i++) {
    const prev = prevFormation[i];
    const next = nextFormation[i];

    // Se um é null e outro não, mudou
    if ((prev === null) !== (next === null)) return false;

    // Se ambos existem, verificar: ninja reference, slotIndex, e order
    if (prev && next) {
      if (prev.ninja !== next.ninja) return false;
      if (prev.slotIndex !== next.slotIndex) return false;
      if (prev.order !== next.order) return false;
    }
  }

  // Se passou em todas as verificações, layoutConfig deve ser igual
  return prevProps.layoutConfig === nextProps.layoutConfig;
});
