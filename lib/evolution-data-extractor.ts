import {
  Ninja,
  NinjaSkillEvolutions,
  SkillCategoryEvolution,
  SkillEvolutionPathGroup,
  SkillEvolutionVariant,
  SkillCategory,
  EvolutionPathType,
  Skill,
} from './types';
import { ApiResponse, ApiNinja, ApiSkill, ApiSkillConfig, SkillItemIdsMap } from './api/real-api';
import { EVOLUTION_PATHS } from './constants';

/**
 * Mapping of ItemIdsMap keys to EvolutionPathType
 * Keys are numeric strings: '0', '1', '10', '11', '12', '20', '21', '22', '23'
 */
const ITEM_IDS_KEY_TO_PATH: Record<string, EvolutionPathType> = {
  '0': 'original',
  '1': 'descoberta',
  '10': 'mutacao_y',
  '11': 'mutacao_y+1',
  '12': 'mutacao_y+2',
  '20': 'ligacao_l',
  '21': 'ligacao_l+1',
  '22': 'ligacao_l+2',
  '23': 'ligacao_l+3',
};

/**
 * Reverse mapping: EvolutionPathType to ItemIdsMap key
 */
const PATH_TO_ITEM_IDS_KEY: Record<EvolutionPathType, string> = {
  'original': '0',
  'descoberta': '1',
  'mutacao_y': '10',
  'mutacao_y+1': '11',
  'mutacao_y+2': '12',
  'ligacao_l': '20',
  'ligacao_l+1': '21',
  'ligacao_l+2': '22',
  'ligacao_l+3': '23',
};

/**
 * Mapping of skill category to ItemIdsMap field
 */
const CATEGORY_TO_ITEM_IDS_MAP: Record<SkillCategory, keyof ApiSkillConfig> = {
  esoterico: 'specialItemIdsMap',
  combate: 'normalItemIdsMap',
  perseguição: 'skillItem1IdsMap',
  passivo1: 'skillItem2IdsMap',
  passivo2: 'skillItem3IdsMap',
  passivo3: 'skillItem4IdsMap',
};

/**
 * Rarity for each evolution path
 */
const PATH_RARITY: Record<EvolutionPathType, number> = {
  'original': 1,
  'descoberta': 2,
  'mutacao_y': 3,
  'mutacao_y+1': 4,
  'mutacao_y+2': 5,
  'ligacao_l': 6,
  'ligacao_l+1': 7,
  'ligacao_l+2': 8,
  'ligacao_l+3': 9,
};

/**
 * Converts ApiSkill to internal Skill
 */
function convertApiSkill(apiSkill: ApiSkill): Skill {
  return {
    id: apiSkill.id,
    name: apiSkill.name,
    desc: apiSkill.desc,
    iconId: apiSkill.iconId,
    mp: apiSkill.mp,
    cd: apiSkill.cd,
    enterCd: apiSkill.enterCd,
    isImmediately: apiSkill.isImmediately,
    showIcon: apiSkill.showIcon,
    ninjutsuLevel: apiSkill.ninjutsuLevel,
    ninJutsuTypeList: apiSkill.ninJutsuTypeList,
    jutsuType: apiSkill.jutsuType,
    skillType: apiSkill.skillType,
    trigger: apiSkill.trigger,
    triggerOnQnt: apiSkill.triggerOnQnt,
    triggerOnRepeat: apiSkill.triggerOnRepeat,
    hitPoint: apiSkill.hitPoint,
    closeRefId: apiSkill.closeRefId,
    reaction: apiSkill.reaction,
    hold: apiSkill.hold,
    Translated: apiSkill.Translated,
  };
}

/**
 * Extracts multiple skills from ItemIdsMap for an evolution path
 *
 * @param itemIdsMap - The ItemIdsMap (e.g., specialItemIdsMap)
 * @param path - The desired evolution path
 * @param allSkills - Map of all API skills
 * @returns Array of Skills found for this path
 */
function getSkillsFromItemIdsMap(
  itemIdsMap: SkillItemIdsMap | undefined,
  path: EvolutionPathType,
  allSkills: Record<string, ApiSkill>
): Skill[] {
  if (!itemIdsMap) return [];

  const key = PATH_TO_ITEM_IDS_KEY[path];
  const value = itemIdsMap[key];

  if (value === null || value === undefined) return [];

  // Handle array vs single value
  const skillIds = Array.isArray(value) ? value : [value];
  const maxVariants = MAX_VARIANTS_PER_PATH[path];

  const skills: Skill[] = [];
  for (let i = 0; i < Math.min(skillIds.length, maxVariants); i++) {
    const skillId = skillIds[i];
    if (skillId !== null && skillId !== undefined) {
      const apiSkill = allSkills[String(skillId)];
      if (apiSkill) {
        skills.push(convertApiSkill(apiSkill));
      }
    }
  }

  return skills;
}

/**
 * Checks if ninja has available ItemIdsMap
 */
function hasItemIdsMap(skillConfig: ApiSkillConfig): boolean {
  return (
    skillConfig.specialItemIdsMap !== undefined ||
    skillConfig.normalItemIdsMap !== undefined ||
    skillConfig.skillItem1IdsMap !== undefined ||
    skillConfig.skillItem2IdsMap !== undefined ||
    skillConfig.skillItem3IdsMap !== undefined ||
    skillConfig.skillItem4IdsMap !== undefined
  );
}

/**
 * Extracts evolution data using ItemIdsMap
 *
 * Checks all possible paths in ItemIdsMap instead of limiting
 * by needMaterialType. Some ninjas have data for higher paths even with
 * lower needMaterialType (e.g., MT=2 with L-connection data).
 */
function extractEvolutionFromItemIdsMap(
  baseNinja: ApiNinja,
  allNinjas: Record<string, ApiNinja>,
  allSkills: Record<string, ApiSkill>
): NinjaSkillEvolutions | null {
  const sc = baseNinja.skillConfig;

  // If needMaterialType is 0, no evolutions available
  if (sc.needMaterialType === 0) {
    return null;
  }

  // Check if ItemIdsMap exists
  if (!hasItemIdsMap(sc)) {
    return null;
  }

  // All possible evolution paths
  // Improvement: Checks ALL paths instead of limiting by needMaterialType
  const allPossiblePaths: EvolutionPathType[] = [...EVOLUTION_PATHS];

  // Create skill map by category and path
  const skillMap: Record<
    SkillCategory,
    Map<EvolutionPathType, SkillEvolutionVariant[]>
  > = {
    esoterico: new Map(),
    combate: new Map(),
    perseguição: new Map(),
    passivo1: new Map(),
    passivo2: new Map(),
    passivo3: new Map(),
  };

  // For each skill category
  for (const [category, itemIdsMapField] of Object.entries(CATEGORY_TO_ITEM_IDS_MAP)) {
    const itemIdsMap = sc[itemIdsMapField] as SkillItemIdsMap | undefined;
    if (!itemIdsMap) continue;

    // For each possible evolution path
    // Only adds if it exists in ItemIdsMap
    for (const path of allPossiblePaths) {
      const skills = getSkillsFromItemIdsMap(itemIdsMap, path, allSkills);
      for (const skill of skills) {
        if (!skillMap[category as SkillCategory].has(path)) {
          skillMap[category as SkillCategory].set(path, []);
        }
        skillMap[category as SkillCategory].get(path)!.push({
          skillId: skill.id,
          skill,
          path,
          rarity: PATH_RARITY[path],
        });
      }
    }
  }

  // Build evolution categories
  const categories: SkillCategoryEvolution[] = [];

  for (const [category, pathToVariants] of Object.entries(
    skillMap,
  ) as [SkillCategory, Map<EvolutionPathType, SkillEvolutionVariant[]>][]) {
    if (pathToVariants.size === 0) continue;

    const pathGroups: SkillEvolutionPathGroup[] = [];

    // Display order of paths
    const pathOrder: EvolutionPathType[] = [...EVOLUTION_PATHS];

    for (const path of pathOrder) {
      const variants = pathToVariants.get(path);
      if (variants && variants.length > 0) {
        pathGroups.push({
          path,
          variants,
        });
      }
    }

    // Add if there's more than one path
    if (pathGroups.length > 1) {
      categories.push({
        category,
        pathGroups,
        selectedPath: 'original',
        selectedVariantIndex: 0,
      });
    }
  }

  if (categories.length === 0) {
    return null;
  }

  return {
    ninjaId: parseInt(baseNinja.id),
    hasEvolutions: true,
    categories,
  };
}

/**
 * Maximum variants per evolution path
 *
 * IMPORTANT: The "Original" column should have only 1 variant (the base/reference ID).
 * This is the starting point ("seed") from which all other evolutions grow.
 * Other columns (discovery, mutation, connection) can have multiple variants.
 */
const MAX_VARIANTS_PER_PATH: Record<EvolutionPathType, number> = {
  original: 1,    // Only 1 ID - the base/reference ID
  descoberta: 2,
  mutacao_y: 3,
  'mutacao_y+1': 4,
  'mutacao_y+2': 5,
  ligacao_l: 4,
  'ligacao_l+1': 5,
  'ligacao_l+2': 6,
  'ligacao_l+3': 7,
};

/**
 * Main function: extracts evolutions for a ninja
 * Exclusively uses ItemIdsMap to extract evolution data
 */
export function extractEvolutionDataForNinja(
  baseNinja: ApiNinja,
  allNinjas: Record<string, ApiNinja>,
  allSkills: Record<string, ApiSkill>
): NinjaSkillEvolutions | null {
  return extractEvolutionFromItemIdsMap(baseNinja, allNinjas, allSkills);
}
