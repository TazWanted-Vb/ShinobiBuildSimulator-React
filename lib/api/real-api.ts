import { Ninja, FormationSlot, Skill, ElementType, NinjaSkillEvolutions, SkillCategoryEvolution, SkillEvolutionVariant, SkillCategory, EvolutionPathType } from '../types';
import { getMockNinjas } from './mock-ninjas';
import { getNinjaImageUrl } from '../image-urls';
import { extractEvolutionDataForNinja } from '../evolution-data-extractor';
import { VILLAGE_IDS, VILLAGE_PATTERNS } from '../constants';

export interface ApiProperty {
  id: string;
  name: string;
}

export interface ApiCareer {
  id: string;
  name: string;
}

export interface ApiElement {
  id: string;
  name: string;
}

export interface ApiAssets {
  bigImg: string;
  display: string;
  ninja: string;
}

export interface SkillItemIdsMap {
  [key: string]: number | number[] | null;
}

export interface ApiSkillConfig {
  needMaterialType: number;
  // Arrays antigos (mantidos para compatibilidade)
  normal: number[][];
  special: number[][];
  skills: number[][];
  // NOVOS: ItemIdsMap fields
  normalItemIdsMap?: SkillItemIdsMap;
  specialItemIdsMap?: SkillItemIdsMap;
  skillItem1IdsMap?: SkillItemIdsMap;
  skillItem2IdsMap?: SkillItemIdsMap;
  skillItem3IdsMap?: SkillItemIdsMap;
  skillItem4IdsMap?: SkillItemIdsMap;
}

export interface ApiSkill {
  id: string;
  name: string;
  desc: string;
  iconId: string;
  mp: number;
  cd: number;
  enterCd: number;
  isImmediately: number;
  showIcon: number;
  ninjutsuLevel: number;
  ninJutsuTypeList: string;
  jutsuType: number[];
  skillType: number;
  trigger: number;
  triggerOnQnt: number;
  triggerOnRepeat: number;
  hitPoint: number[];
  closeRefId: number;
  reaction: number[];
  hold: number;
  Translated: number;
}

export interface ApiStats {
  life: [number, number];
  bodyAtk: [number, number];
  bodyDef: [number, number];
  ninjaAtk: [number, number];
  ninjaDef: [number, number];
}

export interface ApiResistances {
  fire: number;
  wind: number;
  thunder: number;
  soil: number;
  water: number;
}

export interface ApiNinja {
  id: string;
  name: string;
  title: string;
  nameDisplay: string;
  sex: number;
  level: number;
  career: ApiCareer;
  element: ApiElement;
  stats: ApiStats;
  resistances: ApiResistances;
  skills: number[];
  properties: ApiProperty[];
  translated: number;
  ninjaCollection: string;
  assetId: string;
  img: {
    bigImg: string;
    display: string;
    ninja: string;
  } | null;
  assets: ApiAssets;
  skillConfig: ApiSkillConfig;
}

export interface ApiResponse {
  skills: Record<string, ApiSkill>;
  meta: {
    count: number;
    lang: string;
    source: {
      base: string;
      overlay: string | null;
    };
  };
  ninjas: Record<string, ApiNinja>;
  stats: Record<string, unknown>;
}

function mapElement(elementName: string): ElementType {
  if (!elementName || typeof elementName !== 'string') return 'Fisico';

  const normalized = elementName.trim();

  const ELEMENT_MAP: Record<string, ElementType> = {
    'Vento': 'Vento',
    'Fogo': 'Fogo',
    'Agua': 'Agua',
    'Terra': 'Terra',
    'Raio': 'Raio',
    'Sombra': 'Sombra',
    'Físico': 'Fisico',
    'Fisico': 'Fisico',
    'Wind': 'Vento',
    'Fire': 'Fogo',
    'Water': 'Agua',
    'Earth': 'Terra',
    'Lightning': 'Raio',
    'Shadow': 'Sombra',
    'Physical': 'Fisico',
  };

  return ELEMENT_MAP[normalized] ?? 'Fisico';
}

function mapCareer(careerName: string): string {
  if (!careerName || typeof careerName !== 'string') {
    return 'Suporte';
  }

  const normalized = careerName.trim().toLowerCase();

  const CAREER_MAP: Record<string, string> = {
    'ninjutsu': 'Ataque',
    'taijutsu': 'Ataque',
    'genjutsu': 'Suporte',
    'buji': 'Ataque',
    'defense': 'Defesa',
    'defesa': 'Defesa',
    'support': 'Suporte',
    'suporte': 'Suporte',
    'attack': 'Ataque',
    'ataque': 'Ataque',
  };

  return CAREER_MAP[normalized] ?? 'Suporte';
}

function extractVillage(properties: ApiProperty[]): string {
  if (!properties || !Array.isArray(properties)) return 'Unknown';

  for (const prop of properties) {
    if (VILLAGE_IDS.includes(prop.id) && prop.name) {
      return prop.name;
    }
  }

  for (const prop of properties) {
    if (prop.name) {
      const lowerName = prop.name.toLowerCase();
      for (const pattern of VILLAGE_PATTERNS) {
        if (lowerName.includes(pattern.toLowerCase())) {
          return prop.name;
        }
      }
    }
  }

  return 'Unknown';
}

function mapReactionCodesToEffects(reaction: number[]): string[] {
  const EFFECT_MAP: Record<number, string> = {
    0: 'Knockdown',
    1: 'High Float',
    2: 'Low Float',
    4: 'Repulse',
    5: 'High Float',
    6: 'Repulse',
  };

  return reaction.map(code => EFFECT_MAP[code] || `Unknown_${code}`);
}

function parseOrganizations(properties: ApiProperty[]): string[] {
  if (!properties || !Array.isArray(properties)) return [];

  const orgs: string[] = [];

  const villagePatterns = [
    'aldeia', 'village', 'konoha', 'suna', 'kiri', 'iwa', 'kumo', 'oto', 'ame', 'taki'
  ];

  for (const prop of properties) {
    if (!prop.name || prop.name.trim() === '') continue;

    const lowerName = prop.name.toLowerCase();

    const isVillage = villagePatterns.some(pattern => lowerName.includes(pattern));
    if (isVillage) continue;

    if (lowerName === 'homem' || lowerName === 'fêmea' || lowerName === 'male' || lowerName === 'female') {
      continue;
    }

    orgs.push(prop.name.trim());
  }

  return orgs;
}

/**
 * Extract all property names for filtering purposes.
 * This keeps ALL properties (villages, clans, organizations, rank, special, gender)
 * so that filters can work correctly.
 */
function extractPropertyNames(properties: ApiProperty[]): string[] {
  if (!properties || !Array.isArray(properties)) return [];

  const propertyNames: string[] = [];

  for (const prop of properties) {
    if (!prop.name || prop.name.trim() === '') continue;
    propertyNames.push(prop.name.trim());
  }

  return propertyNames;
}

/**
 * Extract chase skill IDs from skill configuration
 */
function extractChaseSkillIds(skillConfig: ApiSkillConfig | undefined): string[] {
  return skillConfig?.skills
    ?.filter((slot): slot is number[] => Boolean(slot && slot.length > 0))
    .flatMap(skillSlot =>
      skillSlot
        .filter(skillId => skillId !== null && skillId !== undefined)
        .map(skillId => String(skillId))
        .filter(skillIdStr => skillIdStr !== 'undefined' && skillIdStr !== 'null' && skillIdStr !== '')
    ) ?? [];
}

/**
 * Parse skill configuration to extract standard attack and mystery skill IDs
 */
function parseSkillConfig(skillConfig: ApiSkillConfig | undefined): { standardAttackId: string; mysterySkillId: string } {
  const standardAttackId = skillConfig?.normal?.[0]?.[0]
    ? String(skillConfig.normal[0][0])
    : '';

  const mysterySkillId = skillConfig?.special?.[0]?.[0]
    ? String(skillConfig.special[0][0])
    : '';

  return { standardAttackId, mysterySkillId };
}

/**
 * Parse mystery skill data including triggers and icon
 */
function parseMysterySkill(
  skills: Record<string, ApiSkill>,
  mysterySkillId: string
): { triggers: string[]; iconId: string; skillType: number; skill: ApiSkill | null } {
  const mysterySkill = mysterySkillId ? skills[mysterySkillId] : null;
  const iconId = mysterySkill?.iconId || mysterySkillId || '';
  const skillType = mysterySkill?.skillType ?? 0;
  const triggers = mysterySkill?.reaction
    ? mapReactionCodesToEffects(mysterySkill.reaction)
    : [];

  return { triggers, iconId, skillType, skill: mysterySkill };
}

/**
 * Parse standard attack skill data
 */
function parseStandardAttackSkill(
  skills: Record<string, ApiSkill>,
  standardAttackId: string
): { iconId: string; skillType: number; skill: ApiSkill | null } {
  const standardAttackSkill = standardAttackId ? skills[standardAttackId] : null;
  const iconId = standardAttackSkill?.iconId || standardAttackId || '';
  const skillType = standardAttackSkill?.skillType ?? 0;

  return { iconId, skillType, skill: standardAttackSkill };
}

/**
 * Parse chase skills data including effects, icons, and types
 */
function parseChaseSkills(
  skills: Record<string, ApiSkill>,
  chaseSkillIds: string[]
): {
  chases: string[];
  chasesGen: string[];
  iconIds: string[];
  types: number[];
  fullSkills: Skill[];
} {
  const chases: string[] = [];
  const chasesGen: string[] = [];
  const iconIds: string[] = [];
  const types: number[] = [];
  const fullSkills: Skill[] = [];

  for (const chaseSkillId of chaseSkillIds) {
    const chaseSkill = skills[chaseSkillId];
    if (chaseSkill?.reaction) {
      const effects = mapReactionCodesToEffects(chaseSkill.reaction);
      chases.push(...effects);
      chasesGen.push(...effects);
    }
    const iconId = chaseSkill?.iconId || chaseSkillId || '';
    iconIds.push(iconId);
    types.push(chaseSkill?.skillType ?? 0);
    if (chaseSkill) {
      fullSkills.push(chaseSkill as Skill);
    }
  }

  return { chases, chasesGen, iconIds, types, fullSkills };
}

/**
 * Calculate ninja power from stats
 */
function calculatePower(stats: ApiStats): number {
  const power = (stats.life[1] ?? 0) +
                (stats.bodyAtk[1] ?? 0) +
                (stats.bodyDef[1] ?? 0) +
                (stats.ninjaAtk[1] ?? 0) +
                (stats.ninjaDef[1] ?? 0);
  return power > 0 ? power : 1000;
}

/**
 * Build ninja object from API data and parsed components
 */
function buildNinjaObject(
  apiNinja: ApiNinja,
  power: number,
  career: string,
  village: string,
  allPropertyNames: string[],
  img: string,
  display: string,
  mysteryData: ReturnType<typeof parseMysterySkill>,
  standardAttackData: ReturnType<typeof parseStandardAttackSkill>,
  chaseData: ReturnType<typeof parseChaseSkills>,
  skillIds: { standardAttackId: string; mysterySkillId: string; chaseSkillIds: string[] }
): Ninja {
  const stats = apiNinja.stats;

  return {
    id: parseInt(apiNinja.id, 10),
    name: apiNinja.name ?? 'Unknown',
    title: apiNinja.title ?? '',
    nameDisplay: apiNinja.nameDisplay ?? (apiNinja.name ?? 'Unknown'),
    element: mapElement(apiNinja.element?.name ?? ''),
    career: career,
    power: power,
    stats: {
      life: stats.life ?? [0, 0],
      bodyAtk: stats.bodyAtk ?? [0, 0],
      bodyDef: stats.bodyDef ?? [0, 0],
      ninjaAtk: stats.ninjaAtk ?? [0, 0],
      ninjaDef: stats.ninjaDef ?? [0, 0],
    },
    level: apiNinja.level ?? 1,
    star: apiNinja.level ?? 1,
    sex: apiNinja.sex ?? 0,
    village: village,
    properties: allPropertyNames,
    resistances: {
      fire: apiNinja.resistances?.fire ?? 0,
      wind: apiNinja.resistances?.wind ?? 0,
      thunder: apiNinja.resistances?.thunder ?? 0,
      soil: apiNinja.resistances?.soil ?? 0,
      water: apiNinja.resistances?.water ?? 0,
    },
    img,
    display,
    assets: apiNinja.assets,
    ninjaCollection: apiNinja.ninjaCollection,
    triggers: mysteryData.triggers,
    chases: chaseData.chases,
    chasesGen: chaseData.chasesGen,
    mysterySkillId: skillIds.mysterySkillId,
    mysterySkillIconId: mysteryData.iconId,
    mysterySkillType: mysteryData.skillType,
    mysterySkill: mysteryData.skill as Skill | undefined,
    standardAttackId: skillIds.standardAttackId,
    standardAttackIconId: standardAttackData.iconId,
    standardAttackSkillType: standardAttackData.skillType,
    standardAttackSkill: standardAttackData.skill as Skill | undefined,
    chaseSkillIds: skillIds.chaseSkillIds,
    chaseSkillIconIds: chaseData.iconIds,
    chaseSkillTypes: chaseData.types,
    chaseSkills: chaseData.fullSkills
  };
}

/**
 * Map a single API ninja to internal Ninja type
 */
function mapApiNinja(apiNinja: ApiNinja, skills: Record<string, ApiSkill>): Ninja {
  const power = calculatePower(apiNinja.stats);

  const { standardAttackId, mysterySkillId } = parseSkillConfig(apiNinja.skillConfig);
  const chaseSkillIds = extractChaseSkillIds(apiNinja.skillConfig);

  const mysteryData = parseMysterySkill(skills, mysterySkillId);
  const standardAttackData = parseStandardAttackSkill(skills, standardAttackId);
  const chaseData = parseChaseSkills(skills, chaseSkillIds);

  const assetId = apiNinja.assetId || '';
  const img = assetId ? getNinjaImageUrl(assetId, 'head') : '';
  const display = assetId ? getNinjaImageUrl(assetId, 'body') : '';

  const organizations = parseOrganizations(apiNinja.properties ?? []);
  const village = extractVillage(apiNinja.properties ?? []);
  const allPropertyNames = extractPropertyNames(apiNinja.properties ?? []);
  const career = mapCareer(apiNinja.career?.name ?? '');

  return buildNinjaObject(
    apiNinja,
    power,
    career,
    village,
    allPropertyNames,
    img,
    display,
    mysteryData,
    standardAttackData,
    chaseData,
    { standardAttackId, mysterySkillId, chaseSkillIds }
  );
}

export async function fetchRealNinjas(locale: string = 'pt'): Promise<Ninja[]> {
  const apiUrl = `http://tazwanted-naruto.server.live:1040/v1/map?lang=${locale}`;

  try {
    const res = await fetch(apiUrl, {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json: ApiResponse = await res.json();

    if (!json?.ninjas || typeof json?.ninjas !== 'object') {
      return [];
    }

    const apiNinjasArray = Object.values(json.ninjas);

    if (typeof window !== 'undefined') {
      try {
        const data = JSON.stringify(apiNinjasArray);
        // Check for storage quota (4MB safety limit)
        if (data.length <= 4_000_000) {
          localStorage.setItem(`shinobebuild_ninjas_${locale}`, data);
          localStorage.setItem(`shinobebuild_ninjas_timestamp_${locale}`, Date.now().toString());
        }
      } catch (e) {
        // Silently fail to cache
      }
    }

    // Map API ninjas to internal Ninja type
    const skills = json.skills || {};
    const mappedNinjas = apiNinjasArray.map((n) => mapApiNinja(n, skills));

    // Extract real evolution data from API based on ninja variants
    const ninjasWithEvolutions = mappedNinjas.map((ninja, index) => {
      // Find the corresponding API ninja to get variants
      const apiNinja = json.ninjas[String(ninja.id)];
      if (apiNinja) {
        const skillEvolutions = extractEvolutionDataForNinja(apiNinja, json.ninjas, json.skills || {});
        if (skillEvolutions) {
          return {
            ...ninja,
            skillEvolutions
          };
        }
      }
      return ninja;
    });

    return ninjasWithEvolutions;
  } catch (error) {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`shinobebuild_ninjas_${locale}`);
        const timestamp = localStorage.getItem(`shinobebuild_ninjas_timestamp_${locale}`);

        if (cached && timestamp) {
          const cacheAge = Date.now() - parseInt(timestamp);
          const maxCacheAge = 24 * 60 * 60 * 1000;

          if (cacheAge < maxCacheAge) {
            return JSON.parse(cached);
          }
        }
      } catch (e) {
        // Silently fail to load cache
      }
    }

    return getMockNinjas();
  }
}
