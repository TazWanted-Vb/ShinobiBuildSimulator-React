"use client";

import { useState, useMemo, memo, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from 'next-intl';
import { Ninja, SelectOption, PropertyCategory, PropertyFilters } from "@/lib/types";
import { NinjaCard } from "./ninja-card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDroppable } from "@dnd-kit/core";
import { useProperties } from "@/components/providers/formation-provider";
import { getPropertiesByCategory, PROPERTY_CATEGORIES } from "@/lib/api";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useDebounce } from "@/hooks/use-debounce";

const VirtualizedNinjaList = dynamic(
  () => import("./virtualized-ninja-list").then(mod => ({ default: mod.VirtualizedNinjaList })),
  { ssr: false }
);

interface NinjaRosterProps {
  ninjas: Ninja[];
  selectedNinjaId: number | null;
  usedNinjaIds: Set<number>;
  onSelectNinja: (id: number) => void;
}

function NinjaRosterComponent({
  ninjas,
  selectedNinjaId,
  usedNinjaIds,
  onSelectNinja,
}: NinjaRosterProps) {
  const t = useTranslations('filters');
  const tCat = useTranslations('propertyCategories');
  const properties = useProperties();

  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({
    villages: "all",
    clans: "all",
    organizations: "all",
    rank: "all",
    special: "all",
    other: "all",
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Memoize handlers to prevent re-creation on every render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePropertyFilterChange = useCallback((category: PropertyCategory, value: string) => {
    setPropertyFilters(prev => ({ ...prev, [category]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setPropertyFilters({
      villages: "all",
      clans: "all",
      organizations: "all",
      rank: "all",
      special: "all",
      other: "all",
    });
  }, []);

  const ninjasKey = useMemo(() => ninjas.map(n => n.id).join(','), [ninjas]);

  // Generate property filter options for each category
  const propertyFilterOptions = useMemo(() => {
    const options: Record<PropertyCategory, SelectOption[]> = {
      villages: [],
      clans: [],
      organizations: [],
      rank: [],
      special: [],
      other: [],
    };

    (PROPERTY_CATEGORIES).forEach(cat => {
      const categoryProperties = getPropertiesByCategory(properties, cat.key);
      const propertyMap = new Map<string, SelectOption>();

      // Show all properties in the category, not just those used by ninjas
      categoryProperties.forEach((property) => {
        if (!propertyMap.has(property.id)) {
          propertyMap.set(property.id, {
            value: property.id,
            label: property.name,
            iconSrc: property.iconUrl,
            iconAlt: property.name
          });
        }
      });

      options[cat.key] = [
        { value: "all", label: tCat(`all.${cat.key}`) },
        ...Array.from(propertyMap.values()).sort((a, b) => a.label.localeCompare(b.label))
      ];
    });

    return options;
  }, [ninjas, properties, tCat]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredNinjas = useMemo(() => {
    return ninjas.filter((ninja) => {
      const matchesSearch = ninja.name
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());

      // Check property filters for each category
      const matchesProperties = (Object.keys(propertyFilters) as PropertyCategory[]).every(category => {
        const filterValue = propertyFilters[category];
        if (filterValue === "all") return true;

        const categoryProperties = getPropertiesByCategory(properties, category);
        return ninja.properties?.some((propName) => {
          const property = categoryProperties.find(p => p.name === propName);
          return property?.id === filterValue;
        });
      });

      return (
        matchesSearch &&
        matchesProperties
      );
    });
  }, [
    ninjasKey,
    debouncedSearchTerm,
    propertyFilters,
    properties,
  ]);

  const filteredNinjasWithStatus = useMemo(() => {
    return filteredNinjas.map((ninja) => ({
      ninja,
      isUsed: usedNinjaIds.has(ninja.id),
      isSelected: selectedNinjaId === ninja.id,
    }));
  }, [filteredNinjas, usedNinjaIds, selectedNinjaId]);

  // Get active filter labels for display
  const activeFilters = useMemo(() => {
    const filters: string[] = [];
    // Add active property filters
    (Object.keys(propertyFilters) as PropertyCategory[]).forEach(category => {
      const filterValue = propertyFilters[category];
      if (filterValue !== "all") {
        const options = propertyFilterOptions[category];
        const label = options.find(o => o.value === filterValue)?.label;
        if (label) filters.push(label);
      }
    });
    return filters;
  }, [propertyFilters, propertyFilterOptions]);

  // Check if any property filter is active
  const hasActivePropertyFilters = useMemo(() => {
    return (Object.keys(propertyFilters) as PropertyCategory[]).some(
      category => propertyFilters[category] !== "all"
    );
  }, [propertyFilters]);

  const { setNodeRef, isOver } = useDroppable({
    id: "roster-zone",
    data: {
      type: "roster",
    },
  });

  // Render property filter selects
  const renderPropertyFilters = () => {
    return PROPERTY_CATEGORIES.map(cat => {
      const options = propertyFilterOptions[cat.key];
      const value = propertyFilters[cat.key];

      // Skip rendering categories with no options besides "all"
      if (options.length <= 1) return null;

      return (
        <Select
          key={cat.key}
          value={value}
          onValueChange={(val) => handlePropertyFilterChange(cat.key, val)}
          options={options}
          placeholder={tCat(cat.key)}
          showIcons={true}
        />
      );
    }).filter(Boolean);
  };

  const hasActiveFilters = hasActivePropertyFilters;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "ninja-roster-section flex flex-col h-full min-h-0 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden transition-all duration-200",
        isOver && "border-green-500/50 bg-green-950/20"
      )}
    >
      <div className="p-2 border-b border-neutral-800 bg-neutral-950 z-20 space-y-2">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Icon
              icon="solar:magnifer-linear"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <Input
              type="text"
              placeholder={t('search')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="h-9 pl-9 text-xs bg-neutral-900 border-neutral-800 text-white placeholder-neutral-600 focus-visible:ring-neutral-700"
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="md:hidden h-9 px-3 flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded hover:border-neutral-700 transition-colors"
          >
            <Icon icon="solar:filter-linear" className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-400">{t('filters')}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Desktop Filters - Properties - auto-fit grid */}
        <div className="hidden md:grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-1.5">
          {renderPropertyFilters()}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-neutral-500">
            <span>{t('results', { count: filteredNinjas.length })}</span>
            {activeFilters.length > 0 && (
              <>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400">
                  {activeFilters.map((filter, index) => (
                    <span key={index}>
                      {index > 0 && <span className="text-neutral-600 mx-1">•</span>}
                      {filter}
                    </span>
                  ))}
                </span>
              </>
            )}
            <button
              onClick={handleClearFilters}
              className="ml-auto text-red-400 hover:text-red-300 transition-colors"
            >
              {t('clear')}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Modal */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent title={t('filters')} onClose={handleClearFilters}>
          <div className="space-y-3">
            {/* Property Filters */}
            <div className="grid grid-cols-2 gap-2">
              {renderPropertyFilters()}
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-800">
              <span>{t('results', { count: filteredNinjas.length })}</span>
              <button
                onClick={() => {
                  handleClearFilters();
                  setIsFilterModalOpen(false);
                }}
                className="text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                {t('clear')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex-1 min-h-0">
        <VirtualizedNinjaList
          ninjas={filteredNinjas}
          selectedNinjaId={selectedNinjaId}
          usedNinjaIds={usedNinjaIds}
          onSelectNinja={onSelectNinja}
        />
      </div>
    </section>
  );
}

export const NinjaRoster = memo(NinjaRosterComponent);
NinjaRoster.displayName = 'NinjaRoster';
