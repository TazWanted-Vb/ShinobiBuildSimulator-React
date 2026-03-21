import { EvolutionPathType } from './types';

export function getPathMarkerLabel(path: EvolutionPathType, variantIndex: number): string {
  // Returns a label for the path marker (e.g., "Y", "Y+1", "L", "L+1", etc.)
  const pathMarkers: Record<EvolutionPathType, string> = {
    'original': '0',
    'descoberta': '1',
    'mutacao_y': 'Y',
    'mutacao_y+1': 'Y+1',
    'mutacao_y+2': 'Y+2',
    'ligacao_l': 'L',
    'ligacao_l+1': 'L+1',
    'ligacao_l+2': 'L+2',
    'ligacao_l+3': 'L+3',
  };

  const baseMarker = pathMarkers[path] || '';

  // If there are multiple variants for the same path, add variant index
  if (variantIndex > 0) {
    return `${baseMarker}${variantIndex + 1}`;
  }

  return baseMarker;
}
