import { Ninja, ComboChain, ComboStep } from './types';

/**
 * Selects a random ninja from the list that has triggers (can start a combo)
 */
function selectRandomStarter(allNinjas: Ninja[]): Ninja | null {
  const starters = allNinjas.filter(n => n.triggers.length > 0);
  if (starters.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * starters.length);
  return starters[randomIndex];
}

/**
 * Finds a random ninja from the pool that chases the given effect
 * Excludes already used ninjas to prevent infinite loops
 */
function findRandomChaser(
  allNinjas: Ninja[],
  effect: string,
  usedIds: Set<number>
): Ninja | null {
  const chasers = allNinjas.filter(
    n => n.chases.includes(effect) && !usedIds.has(n.id)
  );

  if (chasers.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * chasers.length);
  return chasers[randomIndex];
}

/**
 * Generates a single combo chain starting from a random ninja
 */
function generateRandomChain(
  allNinjas: Ninja[],
  starter: Ninja,
  maxChainLength: number
): ComboChain | null {
  if (starter.triggers.length === 0) return null;

  const steps: ComboStep[] = [{
    ninja: starter,
    action: "Esoterica",
    trigger: "Start",
    cause: starter.triggers.join(", "),
    skillId: starter.mysterySkillId,
    iconId: starter.mysterySkillIconId || starter.mysterySkillId || ''
  }];

  let currentEffects = [...starter.triggers];
  const usedIds = new Set<number>([starter.id]);

  // Build the chain
  while (steps.length < maxChainLength) {
    let chaser: Ninja | undefined;
    let matchedTrigger = "";

    // Try to find a chaser for any of the current effects
    for (const effect of currentEffects) {
      const foundChaser = findRandomChaser(allNinjas, effect, usedIds);
      if (foundChaser) {
        chaser = foundChaser;
        matchedTrigger = effect;
        break;
      }
    }

    if (!chaser) break;

    // Add the chaser to the chain
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
  }

  // Only return chains with at least 2 steps (starter + at least one chaser)
  if (steps.length < 2) return null;

  return {
    starter,
    steps,
    totalHits: steps.length
  };
}

/**
 * Generates random combos from all available ninjas
 * @param allNinjas - List of all available ninjas
 * @param count - Number of combos to generate (default: 5)
 * @param maxChainLength - Maximum size of each chain (default: 4)
 * @returns Array of randomly generated combos
 */
export function generateRandomCombos(
  allNinjas: Ninja[],
  count: number = 5,
  maxChainLength: number = 4
): ComboChain[] {
  const chains: ComboChain[] = [];
  const maxAttempts = count * 5; // Prevent infinite loops
  let attempts = 0;

  while (chains.length < count && attempts < maxAttempts) {
    const starter = selectRandomStarter(allNinjas);
    if (starter) {
      const chain = generateRandomChain(allNinjas, starter, maxChainLength);
      if (chain) {
        // Avoid duplicate chains from the same starter
        const isDuplicate = chains.some(c => c.starter.id === chain.starter.id);
        if (!isDuplicate) {
          chains.push(chain);
        }
      }
    }
    attempts++;
  }

  return chains;
}
