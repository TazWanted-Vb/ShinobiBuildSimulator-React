"use client";

import { Header } from "@/components/formation/header";
import { StatsHeader } from "@/components/formation/stats-header";
import { FormationGrid } from "@/components/formation/formation-grid";
import { NinjaRoster } from "@/components/formation/ninja-roster";
import { FormationDndContext } from "@/components/dnd/formation-dnd-context";
import { useFormationActions, useDragState, useStaticFormationData, useDynamicFormationData } from "@/components/providers/formation-provider";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";

export function FormationBuilder() {
  // Split context usage for better memoization
  const { ninjas, isLoadingNinjas } = useStaticFormationData();
  const {
    formationWithOrder,
    selectedNinjaId,
    totalPower,
    usedNinjaIds,
  } = useDynamicFormationData();

  const {
    handleSelectNinja,
    handleSlotClick,
    moveNinjaToSlot,
    clearFormation,
  } = useFormationActions();

  const { setIsDragging, isDragEnabled } = useDragState();

  const t = useTranslations('common');

  const handleDragEnd = useCallback((ninjaId: number, targetSlotIndex: number, sourceSlotIndex?: number) => {
    moveNinjaToSlot(ninjaId, targetSlotIndex, sourceSlotIndex);
  }, [moveNinjaToSlot]);

  return (
    <>
      <Header />
      {isLoadingNinjas ? (
        <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-3 lg:p-6 flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Icon icon="solar:loader-circle-linear" className="text-6xl text-neutral-500 animate-spin mx-auto mb-4" />
            <p className="text-neutral-500">{t('loading')}</p>
          </div>
        </main>
      ) : ninjas.length === 0 ? (
        <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-3 lg:p-6 flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center max-w-md">
            <Icon icon="solar:danger-circle-linear" className="text-6xl text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">{t('loadingError')}</h3>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-7xl mx-auto w-full p-2 sm:p-3 lg:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-4rem)] min-h-0 overflow-hidden select-none">
          <FormationDndContext onDragEnd={handleDragEnd} onDragStateChange={setIsDragging} enabled={isDragEnabled}>
            <section className="md:col-span-5 flex flex-col gap-4 min-h-0">
              <div>
                <StatsHeader totalPower={totalPower} selectedCount={formationWithOrder.length} onClear={clearFormation} />
              </div>
              <div className="flex-1 flex items-center justify-center min-h-0">
                <FormationGrid
                  formationWithOrder={formationWithOrder}
                  onSlotClick={handleSlotClick}
                />
              </div>
            </section>
            <div className="md:col-span-7 min-h-0">
              <NinjaRoster
                ninjas={ninjas}
                selectedNinjaId={selectedNinjaId}
                usedNinjaIds={usedNinjaIds}
                onSelectNinja={handleSelectNinja}
              />
            </div>
          </FormationDndContext>
        </main>
      )}
    </>
  );
}
