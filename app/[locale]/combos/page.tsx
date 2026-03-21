"use client";

import { Fragment } from "react";
import { Header } from "@/components/formation/header";
import { useDynamicFormationData } from "@/components/providers/formation-provider";
import { ComboChain, Ninja } from "@/lib/types";
import { Icon } from "@iconify/react";
import { NinjaTabSelector } from "@/components/skills/ninja-tab-selector";
import { ComboChainFlow } from "@/components/combos/combo-chain-flow";
import { ComboSkillPopoverProvider } from "@/components/combos/combo-skill-popover-context";
import { GlobalComboSkillPopover } from "@/components/combos/global-combo-skill-popover";
import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import { useTranslatedTypes } from "@/lib/i18n-helpers";
import { generateRandomCombos } from "@/lib/combo-random-generator";

export default function CombosPage() {
  const t = useTranslations('combos');
  const { translateSkillType } = useTranslatedTypes();
  const { formation, formationWithOrder } = useDynamicFormationData();
  const [combos, setCombos] = useState<ComboChain[]>([]);

  // Generate random combos whenever formation changes
  useEffect(() => {
    const activeNinjas = formation.filter((n): n is Ninja => n !== null);
    if (activeNinjas.length >= 2) {
      const generated = generateRandomCombos(activeNinjas, 5, 4);
      setCombos(generated);
    } else {
      setCombos([]);
    }
  }, [formation]);

  const activeNinjas = useMemo(() =>
    formation.filter((n) => n !== null),
    [formation]
  );

  const [selectedNinjaId, setSelectedNinjaId] = useState<number | null>(() => {
    const activeNinjas = formationWithOrder.filter((f) => f.ninja);
    return activeNinjas.length > 0 ? activeNinjas[0].ninja.id : null;
  });

  useEffect(() => {
    if (formationWithOrder.length > 0) {
      const ninjaIds = formationWithOrder.map((f) => f.ninja.id);
      if (selectedNinjaId === null || !ninjaIds.includes(selectedNinjaId)) {
        setSelectedNinjaId(formationWithOrder[0].ninja.id);
      }
    } else {
      setSelectedNinjaId(null);
    }
  }, [formationWithOrder, selectedNinjaId]);

  const filteredCombos = useMemo(() => {
    if (selectedNinjaId === null) return combos;
    return combos.filter((chain) => chain.starter.id === selectedNinjaId);
  }, [combos, selectedNinjaId]);

  return (
    <ComboSkillPopoverProvider>
      <Header />
      <main className="flex-1 max-w-full mx-auto w-full p-3 sm:p-4 lg:p-6 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Icon icon="solar:link-circle-linear" className="text-xl sm:text-2xl" />
              <span className="truncate">{t('title')}</span>
            </h2>
          </div>

          {/* Ninja Tab Selector */}
          {formationWithOrder.length > 0 && (
            <div className="mb-6">
              <NinjaTabSelector
                formationWithOrder={formationWithOrder}
                selectedNinjaId={selectedNinjaId}
                onSelectNinja={setSelectedNinjaId}
                showAllOption={false}
              />
            </div>
          )}

          {activeNinjas.length < 2 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-lg border border-neutral-800 border-dashed">
              <Icon icon="solar:users-group-rounded-linear" className="text-4xl text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500">
                {t('minNinjas')}
              </p>
            </div>
          ) : filteredCombos.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-lg border border-neutral-800 border-dashed">
              <Icon icon="solar:confetti-minimalistic-linear" className="text-4xl text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500">
                {t('noCombos', {
                  ninjaName: formationWithOrder.find((f) => f.ninja.id === selectedNinjaId)?.ninja.name || t('common:thisNinja')
                })}
              </p>
              <p className="text-neutral-600 text-sm mt-2">
                {t('tryAnother')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {filteredCombos.map((chain, chainIndex) => {
                return (
                  <div
                    key={`chain-${chain.starter.id}-${chainIndex}-${chain.steps.length}`}
                    className="bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 border border-neutral-700/50 rounded-lg overflow-hidden shadow-lg"
                  >
                    <div className="bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 px-3 sm:px-4 py-2 sm:py-3">
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2 drop-shadow-lg">
                        <Icon icon="mdi:shuriken" className="text-base sm:text-lg lg:text-xl" />
                        <span className="truncate">
                          {t('combo')} · {t('hits', { count: chain.steps.length })} · {t('total', { count: chain.totalHits })}
                        </span>
                      </h3>
                    </div>

                    <div className="p-2 sm:p-3 lg:p-4 bg-neutral-900/50">
                      <ComboChainFlow chain={chain} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <GlobalComboSkillPopover />
    </ComboSkillPopoverProvider>
  );
}
