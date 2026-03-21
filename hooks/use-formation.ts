"use client"

import { useMemo, useCallback, useEffect, useState } from 'react';
import { Ninja, FormationSlot, FormationSlotWithOrder } from '@/lib/types';
import { preloadImage } from '@/lib/utils';

interface UseFormationOptions {
  ninjas: Ninja[];
  showToast?: (message: string, type?: 'error' | 'warning' | 'success' | 'info') => void;
  isDragging?: boolean;
}

// Helper function to show delayed toast notifications
function showDelayedToast(
  showToast: UseFormationOptions['showToast'],
  message: string,
  type: 'error' | 'warning' | 'success' | 'info' = 'info'
) {
  setTimeout(() => showToast?.(message, type), 0);
}

export function useFormation({ ninjas, showToast, isDragging = false }: UseFormationOptions) {
  // Individual slot state for maximum granularity
  const [slots, setSlots] = useState<[FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot]>(
    () => [null, null, null, null, null, null, null, null, null]
  );
  const [selectedNinjaId, setSelectedNinjaId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Derived formation array (for calculations like synergies) - stable reference when slots don't change
  const formation = useMemo(() => slots, [slots]);

  // Derived slotMap for compatibility
  const slotMap = useMemo(() => {
    const map = new Map<number, FormationSlot>();
    slots.forEach((ninja, i) => {
      if (ninja !== null) {
        map.set(i, ninja);
      }
    });
    return map;
  }, [slots]);

  useEffect(() => {
    setMounted(true);
    try {
      localStorage.removeItem('shinobebuild_formation');
    } catch {
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDragging) return; // Don't preload during drag

    // Priority load visible slots first (top row), then rest
    const visibleSlots = formation.slice(0, 3);
    const remainingSlots = formation.slice(3);

    // Load top row images immediately
    visibleSlots.forEach((slot) => {
      if (slot?.display) {
        preloadImage(slot.display);
      }
    });

    // Load remaining images in next frame
    requestAnimationFrame(() => {
      remainingSlots.forEach((slot) => {
        if (slot?.display) {
          preloadImage(slot.display);
        }
      });
    });
  }, [formation, mounted, isDragging]);

  useEffect(() => {
    if (!mounted) return;

    if (formation.some(Boolean) && ninjas.length > 0) {
      // Build ninja Map once for O(1) lookups instead of O(n) × 9 slots = 900 comparisons
      const ninjaMap = new Map(ninjas.map(n => [n.id, n]));

      setSlots(prevSlots => {
        const hasChanges = prevSlots.some((slot) => {
          if (!slot) return false;
          const updatedNinja = ninjaMap.get(slot.id);
          return !updatedNinja || updatedNinja.name !== slot.name;
        });

        if (!hasChanges) {
          return prevSlots;
        }

        return prevSlots.map(slot => {
          if (!slot) return null;
          const updatedNinja = ninjaMap.get(slot.id);
          return updatedNinja || null;
        }) as typeof prevSlots;
      });
    }
  }, [ninjas, formation, mounted]);

  // Stable key for usedNinjaIds to prevent unnecessary re-renders
  // Only changes when the actual set of IDs changes, not when formation order changes
  const usedNinjaIdsKey = useMemo(() => {
    return formation
      .filter(Boolean)
      .map(n => n!.id)
      .sort((a, b) => a - b)
      .join(',');
  }, [formation]);

  const usedNinjaIds = useMemo(() => {
    const ids = formation.filter(Boolean).map(n => n!.id).sort((a, b) => a - b);
    return new Set(ids);
  }, [usedNinjaIdsKey]);

  const isNinjaUsed = useCallback((id: number) => {
    return usedNinjaIds.has(id);
  }, [usedNinjaIds]);

  const usedNinjaNames = useMemo(() => {
    return new Set(formation.filter(Boolean).map(n => n!.name));
  }, [formation]);

  // Type alias for the slots tuple to use in helper functions
  type SlotsTuple = [FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot, FormationSlot];

  // Validation result type
  type ValidationResult = { valid: true } | { valid: false; reason: string; type: 'error' | 'warning' };

  // Helper: Check if a ninja name already exists in formation (excluding target slot)
  const findExistingNameIndex = useCallback((
    slots: FormationSlot[],
    ninjaName: string,
    excludeIndex: number
  ): number => {
    return slots.findIndex((slot, index) =>
      index !== excludeIndex && slot?.name === ninjaName
    );
  }, []);

  // Helper: Check if ninja ID already exists in formation (excluding target slot)
  const isNinjaIdInFormation = useCallback((
    slots: FormationSlot[],
    ninjaId: number,
    excludeIndex: number
  ): boolean => {
    return slots.some((slot, index) =>
      index !== excludeIndex && slot?.id === ninjaId
    );
  }, []);

  // Helper: Validate ninja placement with detailed error messages
  const validateNinjaPlacement = useCallback((
    slots: FormationSlot[],
    ninja: Ninja,
    targetSlotIndex: number
  ): ValidationResult => {
    const existingNameIndex = findExistingNameIndex(slots, ninja.name, targetSlotIndex);

    if (existingNameIndex !== -1) {
      return {
        valid: false,
        reason: `Já existe um ninja com o nome ${ninja.name} na formação`,
        type: 'error'
      };
    }

    const ninjaIdInFormation = isNinjaIdInFormation(slots, ninja.id, targetSlotIndex);

    if (ninjaIdInFormation) {
      return {
        valid: false,
        reason: `${ninja.name} já está na formação`,
        type: 'warning'
      };
    }

    return { valid: true };
  }, [findExistingNameIndex, isNinjaIdInFormation]);

  // Helper: Validate if ninja can be placed from roster (no source slot)
  const validateRosterPlacement = useCallback((
    slots: FormationSlot[],
    ninja: Ninja,
    targetSlotIndex: number
  ): boolean => {
    const result = validateNinjaPlacement(slots, ninja, targetSlotIndex);

    if (!result.valid) {
      showDelayedToast(showToast, result.reason, result.type);
      return false;
    }

    return true;
  }, [validateNinjaPlacement, showToast]);

  const handleSelectNinja = useCallback((id: number) => {
    setSelectedNinjaId(prev => prev === id ? null : id);
  }, []);

  const handleSlotClick = useCallback((index: number) => {
    if (!selectedNinjaId) return;

    setSlots(prevSlots => {
      const ninja = ninjas.find(n => n.id === selectedNinjaId);
      if (!ninja) return prevSlots;

      const validationResult = validateNinjaPlacement(prevSlots, ninja, index);

      if (!validationResult.valid) {
        showDelayedToast(showToast, validationResult.reason, validationResult.type);
        return prevSlots;
      }

      const newSlots = [...prevSlots] as typeof prevSlots;
      newSlots[index] = ninja;
      setSelectedNinjaId(null);
      return newSlots;
    });
  }, [selectedNinjaId, ninjas, showToast, validateNinjaPlacement]);

  const removeNinja = useCallback((index: number) => {
    setSlots(prevSlots => {
      const newSlots = [...prevSlots] as typeof prevSlots;
      newSlots[index] = null;
      return newSlots;
    });
  }, []);

  const clearFormation = useCallback(() => {
    setSlots([null, null, null, null, null, null, null, null, null]);
    setSelectedNinjaId(null);
  }, []);

  const placeNinjaInFirstEmptySlot = useCallback((ninjaId: number) => {
    setSlots(prevSlots => {
      const ninja = ninjas.find(n => n.id === ninjaId);
      if (!ninja) return prevSlots;

      // Find first empty slot
      let emptySlotIndex = -1;
      for (let i = 0; i < 9; i++) {
        if (!prevSlots[i]) {
          emptySlotIndex = i;
          break;
        }
      }

      if (emptySlotIndex === -1) {
        showDelayedToast(showToast, "Formação completa! Remova um ninja primeiro.", "error");
        return prevSlots;
      }

      const validationResult = validateNinjaPlacement(prevSlots, ninja, emptySlotIndex);

      if (!validationResult.valid) {
        showDelayedToast(showToast, validationResult.reason, validationResult.type);
        return prevSlots;
      }

      const newSlots = [...prevSlots] as typeof prevSlots;
      newSlots[emptySlotIndex] = ninja;
      return newSlots;
    });
  }, [ninjas, showToast, validateNinjaPlacement]);

  const placeNinjaAtSlot = useCallback((ninjaId: number, slotIndex: number) => {
    setSlots(prevSlots => {
      const ninja = ninjas.find(n => n.id === ninjaId);
      if (!ninja) return prevSlots;

      const validationResult = validateNinjaPlacement(prevSlots, ninja, slotIndex);

      if (!validationResult.valid) {
        showDelayedToast(showToast, validationResult.reason, validationResult.type);
        return prevSlots;
      }

      const newSlots = [...prevSlots] as typeof prevSlots;
      newSlots[slotIndex] = ninja;
      return newSlots;
    });
  }, [ninjas, showToast, validateNinjaPlacement]);

  // Helper: Validate swap between two slots won't create duplicate names
  const validateSlotSwap = useCallback((
    sourceNinja: FormationSlot,
    targetNinja: FormationSlot
  ): boolean => {
    if (targetNinja && sourceNinja && targetNinja.name === sourceNinja.name) {
      showDelayedToast(showToast, `Não é possível trocar ninjas com o mesmo nome`, "error");
      return false;
    }
    return true;
  }, [showToast]);

  // Helper: Handle removal of ninja from source slot (drag outside grid)
  const handleRemoveFromSlot = useCallback((
    slots: FormationSlot[],
    sourceSlotIndex: number
  ): SlotsTuple => {
    const newSlots = [...slots] as SlotsTuple;
    newSlots[sourceSlotIndex] = null;
    return newSlots;
  }, []);

  // Helper: Swap ninjas between two slots
  const handleSlotSwap = useCallback((
    slots: FormationSlot[],
    sourceSlotIndex: number,
    targetSlotIndex: number,
    ninjaId: number
  ): SlotsTuple | null => {
    const sourceNinja = slots[sourceSlotIndex];
    const targetNinja = slots[targetSlotIndex];

    if (!validateSlotSwap(sourceNinja, targetNinja)) {
      return null;
    }

    if (sourceNinja && sourceNinja.id === ninjaId && sourceSlotIndex !== targetSlotIndex) {
      const newSlots = [...slots] as SlotsTuple;
      newSlots[targetSlotIndex] = sourceNinja;
      newSlots[sourceSlotIndex] = targetNinja;
      return newSlots;
    }

    return null;
  }, [validateSlotSwap]);

  // Helper: Move ninja from roster to slot, clearing any existing placement
  const handleRosterToSlot = useCallback((
    slots: FormationSlot[],
    ninja: Ninja,
    targetSlotIndex: number,
    ninjaId: number
  ): SlotsTuple => {
    const newSlots = [...slots] as SlotsTuple;
    newSlots[targetSlotIndex] = ninja;

    // Remove from existing slot if present
    for (let i = 0; i < newSlots.length; i++) {
      if (i !== targetSlotIndex && newSlots[i]?.id === ninjaId) {
        newSlots[i] = null;
        break;
      }
    }

    return newSlots;
  }, []);

  // Main orchestrator: Move ninja to slot with validation
  const moveNinjaToSlot = useCallback((
    ninjaId: number,
    targetSlotIndex: number,
    sourceSlotIndex?: number
  ) => {
    setSlots(prevSlots => {
      const ninja = ninjas.find(n => n.id === ninjaId);
      if (!ninja) return prevSlots;

      // Handle removal (drag outside the grid)
      if (targetSlotIndex === -1) {
        if (sourceSlotIndex !== undefined) {
          return handleRemoveFromSlot(prevSlots, sourceSlotIndex);
        }
        return prevSlots;
      }

      // Validate placement when moving from roster
      if (sourceSlotIndex === undefined) {
        if (!validateRosterPlacement(prevSlots, ninja, targetSlotIndex)) {
          return prevSlots;
        }
      }

      // Handle swap between two slots
      if (sourceSlotIndex !== undefined) {
        const result = handleSlotSwap(prevSlots, sourceSlotIndex, targetSlotIndex, ninjaId);
        return result !== null ? result : prevSlots;
      }

      // Handle move from roster to slot
      const newSlots = handleRosterToSlot(prevSlots, ninja, targetSlotIndex, ninjaId);
      setSelectedNinjaId(null);
      return newSlots;
    });
  }, [ninjas, handleRemoveFromSlot, validateRosterPlacement, handleSlotSwap, handleRosterToSlot]);

  const totalPower = useMemo(() => {
    if (isDragging) return 0;
    return formation.reduce((acc, curr) => acc + (curr ? curr.power : 0), 0);
  }, [formation, isDragging]);

  // Helper function to check if all slots in a line match a property
  const checkLineMatch = (
    line: FormationSlot[],
    prop: keyof Ninja
  ): string | null => {
    if (line.length !== 3 || !line.every(n => n !== null)) {
      return null;
    }

    const first = line[0]![prop];
    const allMatch = line.every((n): n is Ninja => {
      return n !== null && n[prop] === first;
    });

    return allMatch ? String(first) : null;
  };

  // Detect element synergies in rows
  const detectElementSynergies = (
    grid: FormationSlot[][]
  ): string[] => {
    const synergies: string[] = [];

    grid.forEach((row, i) => {
      // Check if row is complete
      if (row.every(n => n !== null)) {
        synergies.push(`Linha ${i + 1} Completa`);
      }

      // Check for element combo
      const element = checkLineMatch(row, 'element');
      if (element) {
        synergies.push(`Linha ${i + 1}: Combo de ${element}`);
      }
    });

    return synergies;
  };

  // Detect role synergies in columns
  const detectRoleSynergies = (
    grid: FormationSlot[][]
  ): string[] => {
    const synergies: string[] = [];

    for (let c = 0; c < 3; c++) {
      if (!grid[0] || !grid[1] || !grid[2]) continue;

      const col = [grid[0][c], grid[1][c], grid[2][c]];

      // Check if column is complete
      if (col.every(n => n !== null)) {
        synergies.push(`Coluna ${c + 1} Completa`);
      }

      // Check for role/career combo
      const career = checkLineMatch(col, 'career');
      if (career) {
        synergies.push(`Coluna ${c + 1}: Combo de ${career}`);
      }
    }

    return synergies;
  };

  // Detect Team 7 special combo
  const detectTeam7Combo = (
    formationState: FormationSlot[]
  ): string[] => {
    const currentIds = new Set(
      formationState.filter((n): n is Ninja => n !== null).map(n => n.id)
    );

    if ([1, 2, 3].every(id => currentIds.has(id))) {
      return ["🌟 Time 7 Reunido (+15% Stats)"];
    }

    return [];
  };

  // Main function to calculate all synergies
  const calculateSynergies = useCallback((formationState: FormationSlot[]): string[] => {
    const ninjaCount = formationState.filter(Boolean).length;
    if (ninjaCount < 2) return [];
    if (formationState.length < 9) return [];

    const grid: FormationSlot[][] = [
      [formationState[0], formationState[1], formationState[2]],
      [formationState[3], formationState[4], formationState[5]],
      [formationState[6], formationState[7], formationState[8]]
    ];

    const allSynergies: string[] = [
      ...detectElementSynergies(grid),
      ...detectRoleSynergies(grid),
      ...detectTeam7Combo(formationState)
    ];

    return allSynergies;
  }, []);

  const [synergies, setSynergies] = useState<string[]>([]);

  useEffect(() => {
    if (isDragging) return; // Early return during drag

    let cancelled = false;

    requestAnimationFrame(() => {
      if (!cancelled && !isDragging) { // Double-check isDragging in RAF
        const result = calculateSynergies(formation);
        setSynergies(result);
      }
    });

    return () => { cancelled = true; };
  }, [formation, isDragging, calculateSynergies]);

  const formationWithOrder = useMemo(() => {
    const result: FormationSlotWithOrder[] = [];
    let currentOrder = 1;

    for (let slotIndex = 0; slotIndex < formation.length; slotIndex++) {
      const ninja = formation[slotIndex];
      if (ninja !== null) {
        result.push({ slotIndex, order: currentOrder, ninja });
        currentOrder++;
      }
    }

    return result;
  }, [formation]);

  return {
    formation,
    slotMap, // Expose slotMap directly for per-slot context derivation
    selectedNinjaId,
    handleSelectNinja,
    handleSlotClick,
    removeNinja,
    placeNinjaAtSlot,
    placeNinjaInFirstEmptySlot,
    moveNinjaToSlot,
    totalPower,
    synergies,
    usedNinjaIds,
    usedNinjaIdsKey, // Stable key for comparison
    usedNinjaNames,
    formationWithOrder,
    clearFormation
  };
}
