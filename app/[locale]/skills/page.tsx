"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/formation/header";
import { NinjaTabSelector } from "@/components/skills/ninja-tab-selector";
import { SkillCard } from "@/components/skills/skill-card";
import { useDynamicFormationData, useFormationActions } from "@/components/providers/formation-provider";
import { getAllSkillsWithEvolutions } from "@/lib/skill-utils";
import { Icon } from "@iconify/react";
import { useTranslations, useLocale } from 'next-intl';

export default function SkillsPage() {
  const t = useTranslations('skills');
  const locale = useLocale();
  const { formationWithOrder } = useDynamicFormationData();
  const { getEvolvedSkill } = useFormationActions();
  const [selectedNinjaId, setSelectedNinjaId] = useState<number | null>(null);

  const activeNinjas = formationWithOrder;

  useEffect(() => {
    if (activeNinjas.length > 0 && selectedNinjaId === null) {
      setSelectedNinjaId(activeNinjas[0].ninja.id);
    }
  }, [activeNinjas, selectedNinjaId]);

  const allSkills = useMemo(() => {
    const ninjas = activeNinjas.map((f) => f.ninja);
    // Usar skills evoluídas quando disponível
    const skills = getAllSkillsWithEvolutions(ninjas, getEvolvedSkill, locale);

    return selectedNinjaId !== null
      ? skills.filter((s) => s.ninjaId === selectedNinjaId)
      : skills;
  }, [activeNinjas, selectedNinjaId, locale, getEvolvedSkill]);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 overflow-y-auto h-[calc(100vh-64px)] custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Icon icon="solar:magic-stick-3-linear" />
              {t('title')}
            </h2>
            <p className="text-neutral-400 text-sm">
              {t('results', { count: allSkills.length })}
            </p>
          </div>

          {activeNinjas.length > 0 && (
            <div className="mb-6">
              <NinjaTabSelector
                formationWithOrder={activeNinjas}
                selectedNinjaId={selectedNinjaId}
                onSelectNinja={setSelectedNinjaId}
                showAllOption={false}
              />
            </div>
          )}

          {activeNinjas.length === 0 ? (
            <div className="text-center py-20 bg-neutral-900/30 rounded-lg border border-neutral-800 border-dashed">
              <p className="text-neutral-500">
                {t('emptyState')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSkills.map((skill) => (
                <SkillCard
                  key={`${skill.ninjaId}-${skill.id}`}
                  skill={skill}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
