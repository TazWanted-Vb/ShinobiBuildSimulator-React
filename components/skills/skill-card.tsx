import { cn } from "@/lib/utils";
import { memo } from "react";
import Image from "next/image";
import { SkillDisplayData, renderDescriptionWithHighlights, getSkillLabel } from "@/lib/skill-utils";
import { useTranslatedTypes } from "@/lib/i18n-helpers";
import { useTranslations, useLocale } from 'next-intl';

interface SkillCardProps {
  skill: SkillDisplayData;
  className?: string;
}

function SkillCardComponent({ skill, className }: SkillCardProps) {
  const t = useTranslations('skills');
  const { translateSkillType } = useTranslatedTypes();
  const locale = useLocale();
  const label = getSkillLabel(skill, translateSkillType);

  // Color scheme based on skill type
  const colorScheme = {
    mystery: { bg: 'from-purple-900/20 to-neutral-950', border: 'border-purple-500/30', glow: 'shadow-purple-500/10' },
    attack: { bg: 'from-red-900/20 to-neutral-950', border: 'border-red-500/30', glow: 'shadow-red-500/10' },
    chase: { bg: 'from-blue-900/20 to-neutral-950', border: 'border-blue-500/30', glow: 'shadow-blue-500/10' },
  }[skill.skillType];

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br border rounded-xl overflow-hidden shadow-lg",
        "transition-all duration-200 ease-out cursor-pointer",
        "hover:shadow-xl hover:scale-[1.02] hover:border-opacity-70",
        colorScheme.bg,
        colorScheme.border,
        colorScheme.glow,
        className
      )}
    >
      {/* Header - Horizontal Layout */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Icon */}
        <div className="relative w-[52px] h-[52px] rounded-lg overflow-hidden flex-shrink-0 shadow-md">
          {/* Background glow */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br",
            skill.skillType === 'mystery' && 'from-purple-600/30 to-transparent',
            skill.skillType === 'attack' && 'from-red-600/30 to-transparent',
            skill.skillType === 'chase' && 'from-blue-600/30 to-transparent',
          )} />
          {/* Border ring */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none" />
          <img
            src={skill.iconUrl}
            alt={label}
            width={104}
            height={104}
            className="relative z-10 w-full h-full object-contain"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-base font-semibold text-white truncate drop-shadow-md" title={skill.name}>
            {skill.name}
          </h3>

          {/* Type Badge - only show if image URL exists */}
          {skill.skillTypeImageUrl && (
            <img
              src={skill.skillTypeImageUrl}
              alt={label}
              width={40}
              height={40}
              className="w-5 h-5 drop-shadow-md"
            />
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm text-neutral-300 leading-relaxed max-h-[200px] overflow-y-auto hover:overflow-y-auto">
          {renderDescriptionWithHighlights(skill.description)}
        </p>
      </div>

      {/* Stats Section */}
      <div className="mt-2 px-4 pb-4 pt-3 border-t border-neutral-800/50 bg-neutral-950/30">
        {/* Stats Row 1 - Core Stats */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          {/* Cooldown */}
          <div className="flex items-baseline gap-1">
            <span className="text-neutral-500/90">{t('cooldown')}:</span>
            <span className="text-neutral-300 font-medium">
              {skill.cooldown > 0
                ? t('rounds', { count: skill.cooldown })
                : t('instant')}
            </span>
          </div>

          {/* Battlefield Cooldown */}
          {skill.battlefieldCooldown > 0 && (
            <div className="flex items-baseline gap-1">
              <span className="text-neutral-500/90">{t('battlefieldCooldown')}:</span>
              <span className="text-neutral-300 font-medium">
                {t('rounds', { count: skill.battlefieldCooldown })}
              </span>
            </div>
          )}

          {/* Chakra - ALWAYS show, standardized */}
          <div className="flex items-baseline gap-1">
            <span className="text-neutral-500/90">{t('chakra')}:</span>
            <span className={skill.chakra > 0 ? "text-blue-300 font-medium" : "text-neutral-500"}>
              {skill.chakra > 0 ? skill.chakra : t('none')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SkillCard = memo(SkillCardComponent);
SkillCard.displayName = 'SkillCard';
