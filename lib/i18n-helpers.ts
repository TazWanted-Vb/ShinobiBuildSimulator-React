import { useTranslations } from 'next-intl';
import { ElementType } from './types';

const KNOWN_CAREERS = ['Ataque', 'Defesa', 'Suporte', 'Ninjutsu', 'Taijutsu', 'Genjutsu'] as const;

const KNOWN_ELEMENTS: ElementType[] = ['Vento', 'Raio', 'Terra', 'Fogo', 'Agua', 'Sombra', 'Fisico'];

const KNOWN_SKILL_TYPES = ['mystery', 'attack', 'chase'] as const;

export function useTranslatedTypes() {
  const tElement = useTranslations('elements');
  const tCareer = useTranslations('careers');
  const tSkillType = useTranslations('skillTypes');

  const translateElement = (element: ElementType | string): string => {
    if (KNOWN_ELEMENTS.includes(element as ElementType)) {
      return tElement(element as ElementType);
    }
    return element.toString();
  };

  const translateCareer = (career: string): string => {
    const normalizedCareer = career?.trim() || '';

    if (KNOWN_CAREERS.includes(normalizedCareer as typeof KNOWN_CAREERS[number])) {
      return tCareer(normalizedCareer);
    }

    if (!normalizedCareer) {
      return tCareer('unknown');
    }

    return normalizedCareer.charAt(0).toUpperCase() + normalizedCareer.slice(1);
  };

  const translateSkillType = (type: 'mystery' | 'attack' | 'chase' | string): string => {
    if (KNOWN_SKILL_TYPES.includes(type as typeof KNOWN_SKILL_TYPES[number])) {
      return tSkillType(type as 'mystery' | 'attack' | 'chase');
    }
    return type.toString();
  };

  return {
    translateElement,
    translateCareer,
    translateSkillType
  };
}
