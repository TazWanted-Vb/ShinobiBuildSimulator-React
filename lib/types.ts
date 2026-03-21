export type ElementType = 'Vento' | 'Raio' | 'Terra' | 'Fogo' | 'Agua' | 'Sombra' | 'Fisico';

export interface NinjaStats {
  life: [number, number];
  bodyAtk: [number, number];
  bodyDef: [number, number];
  ninjaAtk: [number, number];
  ninjaDef: [number, number];
}

export interface Skill {
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

export interface NinjaAssets {
  bigImg: string;
  display: string;
  ninja: string;
}

export interface Ninja {
  id: number;
  name: string;
  title: string;
  nameDisplay: string;
  element: ElementType;
  career: string;
  power: number;
  stats: NinjaStats;
  level: number;
  star: number;
  sex: number;
  village: string;
  properties: string[];
  resistances: {
    fire: number;
    wind: number;
    thunder: number;
    soil: number;
    water: number;
  };
  img: string;
  display: string; // Display image from API
  assets?: NinjaAssets; // New field from API with image URLs
  ninjaCollection?: string; // New field from API
  triggers: string[];
  chases: string[];
  chasesGen: string[];
  mysterySkillId: string;
  mysterySkillIconId: string;
  mysterySkillType: number;
  mysterySkill?: Skill;
  standardAttackId: string;
  standardAttackIconId: string;
  standardAttackSkillType: number;
  standardAttackSkill?: Skill;
  chaseSkillIds: string[];
  chaseSkillIconIds: string[];
  chaseSkillTypes: number[];
  chaseSkills: Skill[];
  skillEvolutions?: NinjaSkillEvolutions;
}

export type FormationSlot = Ninja | null;

export interface FormationSlotWithOrder {
  slotIndex: number;
  order: number;
  ninja: Ninja; // Non-null by design, but we add safety checks during transitions
}

export interface ComboStep {
  ninja: Ninja;
  action: string;
  trigger: string;
  cause: string;
  skillId: string;
  iconId: string;
}

export interface ComboChain {
  starter: Ninja;
  steps: ComboStep[];
  totalHits: number;
}

// Evolution path types - expanded to include all ItemIdsMap paths
export type EvolutionPathType =
  | 'original'
  | 'descoberta'
  | 'mutacao_y'
  | 'mutacao_y+1'
  | 'mutacao_y+2'
  | 'ligacao_l'
  | 'ligacao_l+1'
  | 'ligacao_l+2'
  | 'ligacao_l+3';

// ItemIdsMap types - can be single ID or array
export type SkillItemIdsMapValue = number | number[] | null;
export type SkillItemIdsMap = Record<string, SkillItemIdsMapValue>;

// Skill type categories for evolution
export type SkillCategory = 'esoterico' | 'combate' | 'perseguição' | 'passivo1' | 'passivo2' | 'passivo3';

// Evolution variant for a skill
export interface SkillEvolutionVariant {
  skillId: string;
  skill: Skill;
  path: EvolutionPathType;
  rarity: number;
}

// Evolution path group - contains multiple variants for a single path
export interface SkillEvolutionPathGroup {
  path: EvolutionPathType;
  variants: SkillEvolutionVariant[];
}

// Evolution options for a skill category
export interface SkillCategoryEvolution {
  category: SkillCategory;
  pathGroups: SkillEvolutionPathGroup[];
  selectedPath: EvolutionPathType;
  selectedVariantIndex: number;
}

// Track selected evolution with variant index
export interface EvolutionSelection {
  path: EvolutionPathType;
  variantIndex: number;
  skillId: string;
}

// Complete evolution data for a ninja
export interface NinjaSkillEvolutions {
  ninjaId: number;
  hasEvolutions: boolean;
  categories: SkillCategoryEvolution[];
}

// Track selected evolution paths per ninja
export interface NinjaEvolutionSelection {
  ninjaId: number;
  selections: Record<SkillCategory, EvolutionPathType>;
}

// Property/organization data from API
export interface PropertyData {
  id: string;
  name: string;
  iconUrl: string;
  category: PropertyCategory;
}

// Property categories for grouping filters
export type PropertyCategory =
  | 'villages'
  | 'clans'
  | 'organizations'
  | 'rank'
  | 'special'
  | 'other';

// Property filter state - one filter per category
export interface PropertyFilters {
  villages: string;
  clans: string;
  organizations: string;
  rank: string;
  special: string;
  other: string;
}

// Extended select option to support icons
export interface SelectOption {
  value: string;
  label: string;
  iconSrc?: string;
  iconAlt?: string;
}
