import React from "react";
import type { Skill, Ninja, SkillCategory } from "./types";
import { getSkillImageUrl, getSkillTypeImageUrl } from "./image-urls";

const LOCALE_TO_API_CODE: Record<string, string> = {
  pt: "br",
  zh: "zh",
} as const;

const AVAILABLE_SKILL_TYPE_IMAGES = [0, 1, 2] as const;

type SkillTypeId = 0 | 1 | 2;

export interface SkillDisplayData {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  chakra: number;
  battlefieldCooldown: number;
  iconUrl: string;
  skillTypeImageUrl: string;
  skillType: "mystery" | "attack" | "chase";
  chaseIndex?: number;
  ninjaId: number;
  ninjaName: string;
  ninjaElement: string;
  ninjaCareer: string;
  hitPoint: number[];
  reaction: number[];
  ninjutsuLevel: number;
  jutsuTypeList: string;
  isImmediately: boolean;
  holdDuration?: number;
}

export function getSkillDisplayData(
  skill: Skill,
  skillType: "mystery" | "attack" | "chase",
  ninja: Ninja,
  chaseIndex?: number,
  locale: string = "pt",
): SkillDisplayData {
  const apiLocale = LOCALE_TO_API_CODE[locale] || "br";
  const iconUrl = skill.iconId
    ? getSkillImageUrl(skill.iconId)
    : getSkillImageUrl(skill.id);

  const skillTypeImageUrl = AVAILABLE_SKILL_TYPE_IMAGES.includes(
    skill.skillType as SkillTypeId,
  )
    ? getSkillTypeImageUrl(apiLocale, skill.skillType as SkillTypeId)
    : "";

  // Generate a guaranteed unique ID using ninjaId, skillType, and chaseIndex
  // This ensures no duplicate keys even if skill.id is undefined
  const uniqueId =
    chaseIndex !== undefined
      ? `${ninja.id}-${skillType}-${chaseIndex}`
      : `${ninja.id}-${skillType}`;

  return {
    id: skill.id || uniqueId,
    name: skill.name,
    description: skill.desc,
    cooldown: skill.cd,
    chakra: skill.mp,
    battlefieldCooldown: skill.enterCd,
    iconUrl,
    skillTypeImageUrl,
    skillType,
    chaseIndex,
    ninjaId: ninja.id,
    ninjaName: ninja.name,
    ninjaElement: ninja.element,
    ninjaCareer: ninja.career,
    hitPoint: skill.hitPoint,
    reaction: skill.reaction,
    ninjutsuLevel: skill.ninjutsuLevel,
    jutsuTypeList: skill.ninJutsuTypeList,
    isImmediately: skill.isImmediately === 1,
    holdDuration: skill.hold || undefined,
  };
}

export function getAllSkillsForNinja(
  ninja: Ninja,
  locale: string = "pt",
): SkillDisplayData[] {
  const skills: SkillDisplayData[] = [];

  if (ninja.mysterySkill) {
    skills.push(
      getSkillDisplayData(
        ninja.mysterySkill,
        "mystery",
        ninja,
        undefined,
        locale,
      ),
    );
  }

  if (ninja.standardAttackSkill) {
    skills.push(
      getSkillDisplayData(
        ninja.standardAttackSkill,
        "attack",
        ninja,
        undefined,
        locale,
      ),
    );
  }

  if (ninja.chaseSkills.length > 0) {
    ninja.chaseSkills.forEach((skill, index) => {
      skills.push(
        getSkillDisplayData(skill, "chase", ninja, index + 1, locale),
      );
    });
  }

  return skills;
}

/**
 * Get all skills for a ninja considering evolution selections
 * This function uses evolved skills when available, falling back to original skills
 */
export function getAllSkillsForNinjaWithEvolutions(
  ninja: Ninja,
  getEvolvedSkill: (ninja: Ninja, category: SkillCategory) => Skill | null,
  locale: string = "pt",
): SkillDisplayData[] {
  const skills: SkillDisplayData[] = [];

  // Mapear categorias de evolução para tipos de exibição
  const categoryToSkillType: Record<SkillCategory, "mystery" | "attack" | "chase"> = {
    esoterico: "mystery",
    combate: "attack",
    perseguição: "chase",
    passivo1: "chase",
    passivo2: "chase",
    passivo3: "chase",
  };

  // Mapeamento de categorias para índices no array chaseSkills
  const categoryToChaseIndex: Partial<Record<SkillCategory, number>> = {
    perseguição: 0,
    passivo1: 1,
    passivo2: 2,
    passivo3: 3,
  };

  // Categorias a verificar
  const categories: Array<{ category: SkillCategory; originalSkill?: Skill }> = [
    { category: "esoterico", originalSkill: ninja.mysterySkill },
    { category: "combate", originalSkill: ninja.standardAttackSkill },
    { category: "perseguição" },
    { category: "passivo1" },
    { category: "passivo2" },
    { category: "passivo3" },
  ];

  for (const { category, originalSkill } of categories) {
    // Tentar obter skill evoluída
    const evolvedSkill = getEvolvedSkill(ninja, category);

    let skillToUse = evolvedSkill || originalSkill;

    // Se não há skill evoluída nem original, tentar obter do array chaseSkills
    if (!skillToUse && categoryToChaseIndex[category] !== undefined) {
      const chaseIndex = categoryToChaseIndex[category];
      if (ninja.chaseSkills[chaseIndex]) {
        skillToUse = ninja.chaseSkills[chaseIndex];
      }
    }

    if (skillToUse) {
      const skillType = categoryToSkillType[category];
      const chaseIndex = skillType === "chase" ? skills.filter(s => s.skillType === "chase").length + 1 : undefined;

      skills.push(
        getSkillDisplayData(
          skillToUse,
          skillType,
          ninja,
          chaseIndex,
          locale,
        ),
      );
    }
  }

  return skills;
}

export function getAllSkills(
  ninjas: Ninja[],
  locale: string = "pt",
): SkillDisplayData[] {
  const skills: SkillDisplayData[] = [];

  ninjas.forEach((ninja) => {
    skills.push(...getAllSkillsForNinja(ninja, locale));
  });

  return skills;
}

/**
 * Get all skills for multiple ninjas considering evolution selections
 */
export function getAllSkillsWithEvolutions(
  ninjas: Ninja[],
  getEvolvedSkill: (ninja: Ninja, category: SkillCategory) => Skill | null,
  locale: string = "pt",
): SkillDisplayData[] {
  const skills: SkillDisplayData[] = [];

  ninjas.forEach((ninja) => {
    skills.push(...getAllSkillsForNinjaWithEvolutions(ninja, getEvolvedSkill, locale));
  });

  return skills;
}

export function parseDescriptionWithHighlights(description: string): string {
  if (!description) return "";

  let parsed = description;

  parsed = parsed.replace(
    /<font\s+color="#4dc831">(.*?)<\/font>/gi,
    '<span class="text-green-400 font-medium">$1</span>',
  );

  parsed = parsed.replace(
    /<font\s+color="([^"]+)">(.*?)<\/font>/gi,
    (match, color, text) => {
      const colorMap: Record<string, string> = {
        "#4dc831": "text-green-400",
        "#ff0000": "text-red-400",
        "#00ff00": "text-green-400",
        "#ffff00": "text-yellow-400",
        "#0000ff": "text-blue-400",
        "#ff00ff": "text-purple-400",
        "#ffa500": "text-orange-400",
      };
      const tailwindColor = colorMap[color.toLowerCase()] || "text-neutral-300";
      return `<span class="${tailwindColor} font-medium">${text}</span>`;
    },
  );

  parsed = parsed.replace(
    /<green>(.*?)<\/green>/g,
    '<span class="text-green-400 font-medium">$1</span>',
  );

  parsed = parsed.replace(/<[^>]+>/g, (match) => {
    if (match.startsWith("<span") || match === "</span>") {
      return match;
    }
    return "";
  });

  return parsed;
}

const MAX_DESCRIPTION_CACHE_SIZE = 500;
const descriptionCache = new Map<string, React.ReactNode>();

function setDescriptionCache(key: string, value: React.ReactNode) {
  // LRU-style cache eviction
  if (descriptionCache.size >= MAX_DESCRIPTION_CACHE_SIZE) {
    const firstKey = descriptionCache.keys().next().value;
    if (firstKey) {
      descriptionCache.delete(firstKey);
    }
  }
  descriptionCache.set(key, value);
}

export function renderDescriptionWithHighlights(
  description: string,
): React.ReactNode {
  // Return cached result if available
  if (descriptionCache.has(description)) {
    return descriptionCache.get(description)!;
  }

  const parsed = parseDescriptionWithHighlights(description);
  const parts = parsed.split(/(<span[^>]*>.*?<\/span>)/g);

  // Use content-based stable prefix so the cache key is truly stable
  const uniqueId = `${description.length}-${description.slice(0, 40)}`;

  const result = parts.map((part, index) => {
    if (part.startsWith("<span")) {
      const classMatch = part.match(/class="([^"]+)"/);
      const contentMatch = part.match(/<span[^>]*>(.*?)<\/span>/);

      if (classMatch && contentMatch) {
        return (
          <span key={`${uniqueId}-${index}`} className={classMatch[1]}>
            {contentMatch[1]}
          </span>
        );
      }
    }
    return <span key={`${uniqueId}-${index}`}>{part}</span>;
  });

  setDescriptionCache(description, result);
  return result;
}

export interface SkillTypeConfig {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  image: string;
}

const SKILL_TYPE_CONFIG: Record<
  string,
  Omit<SkillTypeConfig, "label" | "image">
> = {
  mystery: {
    colorClass: "text-neutral-300",
    bgClass: "bg-neutral-500/10",
    borderClass: "border-neutral-500/20",
  },
  attack: {
    colorClass: "text-neutral-300",
    bgClass: "bg-neutral-500/10",
    borderClass: "border-neutral-500/20",
  },
  chase: {
    colorClass: "text-neutral-300",
    bgClass: "bg-neutral-500/10",
    borderClass: "border-neutral-500/20",
  },
};

export function getSkillTypeConfig(
  skillType: string,
  translateSkillType: (type: string) => string,
  skillTypeId: number,
  locale: string,
): SkillTypeConfig {
  const baseConfig = SKILL_TYPE_CONFIG[skillType] || SKILL_TYPE_CONFIG.attack;
  const apiLocale = LOCALE_TO_API_CODE[locale] || "br";

  return {
    ...baseConfig,
    label: translateSkillType(skillType),
    image: getSkillTypeImageUrl(apiLocale, skillTypeId),
  };
}

export function getSkillLabel(
  skill: SkillDisplayData,
  translateSkillType: (type: string) => string,
): string {
  return translateSkillType(skill.skillType);
}

const EFFECT_MAP: Record<number, { pt: string; zh: string }> = {
  0: { pt: "Queda", zh: "击倒" },
  1: { pt: "Voo Alto", zh: "浮空" },
  2: { pt: "Flutuação", zh: "低空" },
  4: { pt: "Repelimento", zh: "击退" },
  5: { pt: "Voo Alto", zh: "浮空" },
  6: { pt: "Repelimento", zh: "击退" },
};

export function formatEffects(reaction: number[], locale: string): string[] {
  if (!reaction || reaction.length === 0) return [];
  return reaction
    .map((code) => {
      const effectMap = EFFECT_MAP[code];
      if (!effectMap) return null;
      if (locale === "zh" && effectMap.zh) return effectMap.zh;
      return effectMap.pt || null;
    })
    .filter((effect): effect is string => effect !== null && effect !== "");
}

export { LOCALE_TO_API_CODE };
