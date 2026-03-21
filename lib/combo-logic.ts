import { Ninja, ComboChain, ComboStep } from "./types";

interface CacheEntry {
  chains: ComboChain[];
  timestamp: number;
}

const MAX_CACHE_SIZE = 50;
const CACHE_TTL = 5000; // 5 seconds
const comboCache = new Map<string, CacheEntry>();

function generateFormationKey(formation: (Ninja | null)[]): string {
  return formation.map(n => n?.id ?? 'null').join('|');
}

function cleanExpiredEntries(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, entry] of comboCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach(key => comboCache.delete(key));
}

/**
 * Evict oldest entry (LRU-style)
 */
function evictOldestEntry(): void {
  if (comboCache.size === 0) return;

  let oldestKey: string | null = null;
  let oldestTimestamp = Infinity;

  for (const [key, entry] of comboCache.entries()) {
    if (entry.timestamp < oldestTimestamp) {
      oldestTimestamp = entry.timestamp;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    comboCache.delete(oldestKey);
  }
}

/**
 * Clear the combo cache (useful for testing)
 */
export function clearComboCache(): void {
  comboCache.clear();
}

export function calculateCombos(formation: (Ninja | null)[]): ComboChain[] {
  const activeNinjas = formation.filter((n): n is Ninja => n !== null);

  if (activeNinjas.length < 2) return [];

  // Check cache first
  const cacheKey = generateFormationKey(formation);
  const cachedEntry = comboCache.get(cacheKey);
  const now = Date.now();

  if (cachedEntry && (now - cachedEntry.timestamp) < CACHE_TTL) {
    return cachedEntry.chains;
  }

  // Clean expired entries periodically
  if (comboCache.size > MAX_CACHE_SIZE * 0.8) {
    cleanExpiredEntries();
  }

  const chains: ComboChain[] = [];

  // Pre-build chaser lookup map for O(1) lookups
  const chaserLookup = new Map<string, Ninja[]>();
  activeNinjas.forEach(ninja => {
    ninja.chases.forEach(chase => {
      if (!chaserLookup.has(chase)) {
        chaserLookup.set(chase, []);
      }
      chaserLookup.get(chase)!.push(ninja);
    });
  });

  activeNinjas.forEach(starter => {
    const initialEffects = starter.triggers;

    if (initialEffects.length === 0) return;

    const steps: ComboStep[] = [{
      ninja: starter,
      action: "Esoterica",
      trigger: "Start",
      cause: initialEffects.join(", "),
      skillId: starter.mysterySkillId,
      iconId: starter.mysterySkillIconId || starter.mysterySkillId || ''
    }];

    let currentEffects = [...initialEffects];
    const usedIds = new Set<number>([starter.id]);

    let chainActive = true;
    while (chainActive) {
      chainActive = false;

      // Use lookup map instead of nested loops - O(1) instead of O(n²)
      let chaser: Ninja | undefined;
      let matchedTrigger = "";

      for (const effect of currentEffects) {
        const chasers = chaserLookup.get(effect);
        if (chasers) {
          chaser = chasers.find(n => !usedIds.has(n.id));
          if (chaser) {
            matchedTrigger = effect;
            break;
          }
        }
      }

      if (chaser) {
        const nextEffects = chaser.chasesGen.length > 0 ? chaser.chasesGen : chaser.triggers;

        const firstChaseSkillId = chaser.chaseSkillIds?.[0] || '';
        const firstChaseSkillIconId = chaser.chaseSkillIconIds?.[0] || '';
        const finalIconId = firstChaseSkillIconId || firstChaseSkillId || '';

        steps.push({
          ninja: chaser,
          action: "Perseguicao",
          trigger: matchedTrigger,
          cause: nextEffects.join(", "),
          skillId: firstChaseSkillId,
          iconId: finalIconId
        });

        currentEffects = nextEffects;
        usedIds.add(chaser.id);
        chainActive = true;
      }
    }

    if (steps.length > 1) {
      chains.push({
        starter,
        steps,
        totalHits: steps.length
      });
    }
  });

  // Cache the result
  if (comboCache.size >= MAX_CACHE_SIZE) {
    evictOldestEntry();
  }

  comboCache.set(cacheKey, { chains, timestamp: now });

  return chains;
}
