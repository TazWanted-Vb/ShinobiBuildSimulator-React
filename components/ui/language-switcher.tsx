"use client";

import React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n';
import { useTranslations } from 'next-intl';
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

const locales = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export const LanguageSwitcher = React.memo(function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Memoize handlers to prevent re-renders
  const toggleOpen = React.useCallback(() => setIsOpen(prev => !prev), []);

  const handleLocaleChange = React.useCallback((newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  }, [router, pathname]);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(prev => !prev);
    }
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex items-center gap-2 px-2.5 py-2 text-xs font-medium rounded border transition-colors",
          "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 active:border-neutral-600",
        )}
        aria-label={t('label')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Icon icon="solar:global-linear" className="text-base" aria-hidden="true" />
        <span className="uppercase font-semibold">{locale}</span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={cn(
            "text-neutral-500 transition-transform text-xs",
            isOpen && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 min-w-full rounded border border-neutral-800 bg-neutral-950 shadow-lg"
          role="listbox"
          aria-label={t('label')}
        >
          {locales.map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => handleLocaleChange(loc.code)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-xs text-left transition-colors",
                locale === loc.code
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white active:bg-neutral-800",
              )}
              role="option"
              aria-selected={locale === loc.code}
            >
              <span className="text-base" aria-hidden="true">{loc.flag}</span>
              <span>{loc.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
