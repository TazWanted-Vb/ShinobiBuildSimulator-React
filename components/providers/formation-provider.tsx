"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useFormation } from "@/hooks/use-formation";
import { useLocale } from "next-intl";
import { useToast } from "@/components/providers/toast-provider";
import {
  Ninja,
  FormationSlot,
  FormationSlotWithOrder,
  EvolutionPathType,
  SkillCategory,
  Skill,
  EvolutionSelection,
  PropertyData,
} from "@/lib/types";

interface FormationStaticDataType {
  ninjas: Ninja[];
  isLoadingNinjas: boolean;
  properties: PropertyData[];
}

interface FormationDynamicDataType {
  formation: FormationSlot[];
  selectedNinjaId: number | null;
  totalPower: number;
  synergies: string[];
  usedNinjaIds: Set<number>;
  usedNinjaIdsKey: string;
  formationWithOrder: FormationSlotWithOrder[];
  evolutionSelections: Map<
    number,
    Record<SkillCategory, EvolutionSelection>
  >;
}

interface FormationActionsType {
  handleSelectNinja: (id: number) => void;
  handleSlotClick: (index: number) => void;
  removeNinja: (index: number) => void;
  placeNinjaAtSlot: (ninjaId: number, slotIndex: number) => void;
  placeNinjaInFirstEmptySlot: (ninjaId: number) => void;
  moveNinjaToSlot: (
    ninjaId: number,
    slotIndex: number,
    sourceSlotIndex?: number,
  ) => void;
  clearFormation: () => void;
  setEvolutionPath: (
    ninjaId: number,
    category: SkillCategory,
    path: EvolutionPathType,
    variantIndex: number,
    skillId: string,
  ) => void;
  resetEvolutions: (ninjaId: number) => void;
  getEvolvedSkill: (ninja: Ninja, category: SkillCategory) => Skill | null;
  getEvolutionSelections: () => Map<
    number,
    Record<SkillCategory, EvolutionSelection>
  >;
}

interface DragStateContextType {
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  isDragEnabled: boolean;
  toggleDragEnabled: () => void;
  evolutionDialogOpen: boolean;
  setEvolutionDialogOpen: (open: boolean) => void;
}

const DragStateContextInternal = createContext<
  DragStateContextType | undefined
>(undefined);

const FormationStaticDataContext = createContext<
  FormationStaticDataType | undefined
>(undefined);
const FormationDynamicDataContext = createContext<
  FormationDynamicDataType | undefined
>(undefined);
const FormationActionsContext = createContext<FormationActionsType | undefined>(
  undefined,
);

interface FormationProviderProps {
  children: ReactNode;
  initialNinjas: Ninja[];
  initialProperties?: PropertyData[];
}

export function FormationProvider({
  children,
  initialNinjas,
  initialProperties = [],
}: FormationProviderProps) {
  const locale = useLocale();
  const { showToast } = useToast();
  const [ninjas, setNinjas] = useState<Ninja[]>(initialNinjas);
  const [isLoadingNinjas, setIsLoadingNinjas] = useState(false);
  const [properties, setProperties] = useState<PropertyData[]>(initialProperties);

  // Track the initial locale to determine if we need to refetch
  const initialLocaleRef = useRef<string | null>(null);
  const initialFetchDoneRef = useRef(false);
  const hasMountedRef = useRef(false);
  const clearFormationRef = useRef<(() => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(true);
  const [evolutionDialogOpen, setEvolutionDialogOpen] = useState(false);

  // Memoize setter functions to maintain stable references in context
  const setIsDraggingCallback = useCallback((value: boolean) => {
    setIsDragging(value);
  }, []);

  const setEvolutionDialogOpenCallback = useCallback((value: boolean) => {
    setEvolutionDialogOpen(value);
  }, []);
  const [evolutionSelections, setEvolutionSelections] = useState<
    Map<number, Record<SkillCategory, EvolutionSelection>>
  >(new Map());

  const toggleDragEnabled = useCallback(() => {
    setIsDragEnabled((prev) => !prev);
  }, []);

  // Evolution actions
  const setEvolutionPath = useCallback(
    (
      ninjaId: number,
      category: SkillCategory,
      path: EvolutionPathType,
      variantIndex: number,
      skillId: string,
    ) => {
      setEvolutionSelections((prev) => {
        const newMap = new Map(prev);
        const currentSelections =
          newMap.get(ninjaId) ||
          ({
            esoterico: { path: "original", variantIndex: 0, skillId: "" },
            combate: { path: "original", variantIndex: 0, skillId: "" },
            perseguição: { path: "original", variantIndex: 0, skillId: "" },
            passivo1: { path: "original", variantIndex: 0, skillId: "" },
            passivo2: { path: "original", variantIndex: 0, skillId: "" },
          } as Record<SkillCategory, EvolutionSelection>);
        newMap.set(ninjaId, {
          ...currentSelections,
          [category]: { path, variantIndex, skillId },
        });
        return newMap;
      });
    },
    [],
  );

  const resetEvolutions = useCallback((ninjaId: number) => {
    setEvolutionSelections((prev) => {
      const newMap = new Map(prev);
      newMap.delete(ninjaId);
      return newMap;
    });
  }, []);

  const getEvolvedSkill = useCallback(
    (ninja: Ninja, category: SkillCategory): Skill | null => {
      if (!ninja.skillEvolutions) return null;

      const selections = evolutionSelections.get(ninja.id);
      const categoryEvolution = ninja.skillEvolutions.categories.find(
        (c) => c.category === category,
      );

      if (!categoryEvolution) return null;

      const selectedPath = selections?.[category]?.path || "original";
      const selectedVariantIndex =
        selections?.[category]?.variantIndex || 0;

      // Find the path group
      const pathGroup = categoryEvolution.pathGroups.find(
        (pg) => pg.path === selectedPath,
      );

      // Get specific variant by index
      const selectedVariant = pathGroup?.variants[selectedVariantIndex];

      return selectedVariant?.skill || null;
    },
    [evolutionSelections],
  );

  const getEvolutionSelections = useCallback(() => {
    return evolutionSelections;
  }, [evolutionSelections]);

  const formationState = useFormation({ ninjas, showToast, isDragging });

  clearFormationRef.current = formationState.clearFormation;

  useEffect(() => {
    if (hasMountedRef.current && ninjas.length === 0) {
      clearFormationRef.current?.();
    }
  }, [ninjas.length]);

  useEffect(() => {
    if (initialLocaleRef.current === null) {
      initialLocaleRef.current = locale;
      initialFetchDoneRef.current = true;
      return;
    }

    if (locale !== initialLocaleRef.current) {
      async function reloadNinjas() {
        setIsLoadingNinjas(true);
        try {
          const [ninjasResponse, propertiesResponse] = await Promise.all([
            fetch(`/api/ninjas?lang=${locale}`, {
              cache: "force-cache",
              next: { revalidate: 3600 },
            }),
            fetch(`/api/properties?lang=${locale}`, {
              cache: "force-cache",
              next: { revalidate: 86400 },
            }),
          ]);

          if (ninjasResponse.ok) {
            const data = await ninjasResponse.json();
            setNinjas(data.ninjas || []);
          }

          if (propertiesResponse.ok) {
            const data = await propertiesResponse.json();
            setProperties(data.properties || []);
          }
        } catch {
        } finally {
          setIsLoadingNinjas(false);
        }
      }

      reloadNinjas();

      initialLocaleRef.current = locale;
    }
  }, [locale]);

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  const dragStateContextValue = useMemo<DragStateContextType>(
    () => ({
      isDragging,
      setIsDragging: setIsDraggingCallback,
      isDragEnabled,
      toggleDragEnabled,
      evolutionDialogOpen,
      setEvolutionDialogOpen: setEvolutionDialogOpenCallback,
    }),
    [isDragging, isDragEnabled, toggleDragEnabled, evolutionDialogOpen, setIsDraggingCallback, setEvolutionDialogOpenCallback],
  );

  const actionsContextValue = useMemo<FormationActionsType>(
    () => ({
      handleSelectNinja: formationState.handleSelectNinja,
      handleSlotClick: formationState.handleSlotClick,
      removeNinja: formationState.removeNinja,
      placeNinjaAtSlot: formationState.placeNinjaAtSlot,
      placeNinjaInFirstEmptySlot: formationState.placeNinjaInFirstEmptySlot,
      moveNinjaToSlot: formationState.moveNinjaToSlot,
      clearFormation: formationState.clearFormation,
      setEvolutionPath,
      resetEvolutions,
      getEvolvedSkill,
      getEvolutionSelections,
    }),
    [
      formationState.handleSelectNinja,
      formationState.handleSlotClick,
      formationState.removeNinja,
      formationState.placeNinjaAtSlot,
      formationState.placeNinjaInFirstEmptySlot,
      formationState.moveNinjaToSlot,
      formationState.clearFormation,
      setEvolutionPath,
      resetEvolutions,
      getEvolvedSkill,
      getEvolutionSelections,
    ],
  );

  // Static data - rarely changes (only when locale changes or ninjas reload)
  const staticDataContextValue = useMemo<FormationStaticDataType>(
    () => ({
      ninjas,
      isLoadingNinjas,
      properties,
    }),
    [ninjas, isLoadingNinjas, properties],
  );

  // Dynamic data - changes on slot operations
  const dynamicDataContextValue = useMemo<FormationDynamicDataType>(
    () => ({
      formation: formationState.formation,
      selectedNinjaId: formationState.selectedNinjaId,
      totalPower: formationState.totalPower,
      synergies: formationState.synergies,
      usedNinjaIds: formationState.usedNinjaIds,
      usedNinjaIdsKey: formationState.usedNinjaIdsKey,
      formationWithOrder: formationState.formationWithOrder,
      evolutionSelections,
    }),
    [
      formationState.formation,
      formationState.selectedNinjaId,
      formationState.totalPower,
      formationState.synergies,
      formationState.usedNinjaIds,
      formationState.usedNinjaIdsKey,
      formationState.formationWithOrder,
      evolutionSelections,
    ],
  );

  return (
    <DragStateContextInternal.Provider value={dragStateContextValue}>
      <FormationActionsContext.Provider value={actionsContextValue}>
        <FormationStaticDataContext.Provider value={staticDataContextValue}>
          <FormationDynamicDataContext.Provider value={dynamicDataContextValue}>
            {children}
          </FormationDynamicDataContext.Provider>
        </FormationStaticDataContext.Provider>
      </FormationActionsContext.Provider>
    </DragStateContextInternal.Provider>
  );
}

export function useStaticFormationData(): FormationStaticDataType {
  const context = useContext(FormationStaticDataContext);
  if (context === undefined) {
    throw new Error(
      "useStaticFormationData must be used within FormationProvider",
    );
  }
  return context;
}

export function useDynamicFormationData(): FormationDynamicDataType {
  const context = useContext(FormationDynamicDataContext);
  if (context === undefined) {
    throw new Error(
      "useDynamicFormationData must be used within FormationProvider",
    );
  }
  return context;
}

export function useFormationActions(): FormationActionsType {
  const context = useContext(FormationActionsContext);
  if (context === undefined) {
    throw new Error(
      "useFormationActions must be used within FormationProvider",
    );
  }
  return context;
}

export function useDragState(): DragStateContextType {
  const context = useContext(DragStateContextInternal);
  if (context === undefined) {
    throw new Error("useDragState must be used within FormationProvider");
  }
  return context;
}

export function useProperties(): PropertyData[] {
  const context = useContext(FormationStaticDataContext);
  if (context === undefined) {
    throw new Error("useProperties must be used within FormationProvider");
  }
  return context.properties;
}
