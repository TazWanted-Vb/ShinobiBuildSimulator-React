import { Ninja } from '../types';
import { fetchRealNinjas } from './real-api';
export {
  fetchProperties,
  getPropertyIconUrl,
  getPropertiesByCategory,
  PROPERTY_CATEGORIES
} from './properties-api';
export type { PropertyCategoryInfo } from './properties-api';

const cachedRealNinjasByLocale: Record<string, Ninja[]> = {};
const fetchInProgressByLocale: Record<string, Promise<Ninja[]>> = {};

export async function fetchNinjas(locale?: string): Promise<Ninja[]> {
  const effectiveLocale = locale || 'pt';

  if (cachedRealNinjasByLocale[effectiveLocale]) {
    return cachedRealNinjasByLocale[effectiveLocale];
  }

  if (fetchInProgressByLocale[effectiveLocale] !== undefined) {
    return fetchInProgressByLocale[effectiveLocale];
  }

  try {
    const fetchPromise = fetchRealNinjas(effectiveLocale).then(ninjas => {
      cachedRealNinjasByLocale[effectiveLocale] = ninjas;
      delete fetchInProgressByLocale[effectiveLocale];
      return ninjas;
    }).catch(() => {
      delete fetchInProgressByLocale[effectiveLocale];
      return [];
    });

    fetchInProgressByLocale[effectiveLocale] = fetchPromise;
    return fetchPromise;
  } catch {
    return [];
  }
}

export function clearCache(locale?: string): void {
  if (locale) {
    delete cachedRealNinjasByLocale[locale];
  } else {
    Object.keys(cachedRealNinjasByLocale).forEach(key => {
      delete cachedRealNinjasByLocale[key];
    });
  }
}

