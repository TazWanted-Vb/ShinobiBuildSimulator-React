import { EvolutionPathType } from './types';

/**
 * Village property IDs from the API
 * These IDs identify village properties in the ninja's properties array
 */
export const VILLAGE_IDS: readonly string[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
] as const;

/**
 * Village name patterns for extracting village from properties
 * Includes both Portuguese and English village names
 */
export const VILLAGE_PATTERNS: readonly string[] = [
  'Aldeia da Folha',
  'Aldeia da Areia',
  'Aldeia da Névoa',
  'Aldeia da Nuvem',
  'Aldeia da Pedra',
  'Aldeia do Som',
  'Aldeia da Chuva',
  'Aldeia das Fontes Termais',
  'Konoha',
  'Suna',
  'Kiri',
  'Iwa',
  'Kumo',
  'Oto',
  'Ame',
  'Taki',
] as const;

/**
 * All evolution path types in display order
 * Defines the complete evolution tree structure
 */
export const EVOLUTION_PATHS: readonly EvolutionPathType[] = [
  'original',
  'descoberta',
  'mutacao_y',
  'mutacao_y+1',
  'mutacao_y+2',
  'ligacao_l',
  'ligacao_l+1',
  'ligacao_l+2',
  'ligacao_l+3',
] as const;

/**
 * Type guard to check if a string is a valid EvolutionPathType
 */
export function isValidEvolutionPath(path: string): path is EvolutionPathType {
  return EVOLUTION_PATHS.includes(path as EvolutionPathType);
}
