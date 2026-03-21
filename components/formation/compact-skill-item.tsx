"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import type { SkillDisplayData } from "@/lib/skill-utils";
import { getSkillTypeConfig, renderDescriptionWithHighlights } from "@/lib/skill-utils";
import { useTranslatedTypes } from "@/lib/i18n-helpers";
import { useLocale, useTranslations } from "next-intl";

interface CompactSkillItemProps {
  skill: SkillDisplayData;
}

/**
 * Custom comparison function for React.memo
 * Only re-renders when skill content actually changes
 */
function arePropsEqual(prevProps: CompactSkillItemProps, nextProps: CompactSkillItemProps): boolean {
  return (
    prevProps.skill.id === nextProps.skill.id &&
    prevProps.skill.name === nextProps.skill.name &&
    prevProps.skill.description === nextProps.skill.description &&
    prevProps.skill.cooldown === nextProps.skill.cooldown &&
    prevProps.skill.chakra === nextProps.skill.chakra &&
    prevProps.skill.battlefieldCooldown === nextProps.skill.battlefieldCooldown
  );
}

export function CompactSkillItem({ skill }: CompactSkillItemProps) {
  const locale = useLocale();
  const { translateSkillType } = useTranslatedTypes();
  const t = useTranslations('skills');

  // Memoize skill type config to prevent recalculation
  const config = useMemo(
    () => getSkillTypeConfig(
      skill.skillType,
      translateSkillType,
      0,
      locale,
    ),
    [skill.skillType, translateSkillType, locale]
  );
  const label = config.label;

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="flex items-start gap-3 p-3 pb-2">
        <div className="relative w-[48px] h-[48px] rounded-lg overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0">
          <Image
            src={skill.iconUrl}
            alt={label}
            width={48}
            height={48}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className="text-sm font-semibold text-white truncate"
              title={skill.name}
            >
              {skill.name}
            </h4>
            {skill.skillTypeImageUrl && (
              <Image
                src={skill.skillTypeImageUrl}
                alt={config.label}
                width={16}
                height={16}
                className="w-4 h-4 drop-shadow-md flex-shrink-0"
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <p className="text-xs text-neutral-300 leading-relaxed">
          {renderDescriptionWithHighlights(skill.description)}
        </p>
      </div>

      <div className="px-3 pb-3 pt-2 border-t border-neutral-800 bg-neutral-950/30">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <div className="flex items-baseline gap-1">
            <span className="text-neutral-500/90 text-[10px]">{t('cooldown')}:</span>
            <span className="text-neutral-300 text-[11px] font-medium">
              {skill.cooldown > 0
                ? t('rounds', { count: skill.cooldown })
                : t('instant')}
            </span>
          </div>

          {skill.battlefieldCooldown > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-neutral-500/90 text-[10px]">{t('battlefieldCooldown')}:</span>
              <span className="text-neutral-300 text-[11px] font-medium">
                {t('rounds', { count: skill.battlefieldCooldown })}
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-neutral-500/90 text-[10px]">{t('chakra')}:</span>
            <span className={skill.chakra > 0 ? "text-blue-300 text-[11px] font-medium" : "text-neutral-500 text-[11px]"}>
              {skill.chakra > 0 ? skill.chakra : t('none')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MemoizedCompactSkillItem = React.memo(CompactSkillItem, arePropsEqual);
MemoizedCompactSkillItem.displayName = 'MemoizedCompactSkillItem';
