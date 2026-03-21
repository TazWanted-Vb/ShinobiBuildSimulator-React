"use client";

import { Icon } from "@iconify/react";
import { Link } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { memo } from "react";

export const Header = memo(function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems = [
    { nameKey: "ninjas", path: "/", ariaLabelKey: "ninjasAria" },
    { nameKey: "skills", path: "/skills", ariaLabelKey: "skillsAria" },
    { nameKey: "combos", path: "/combos", ariaLabelKey: "combosAria" },
  ];

  return (
    <header className="border-b border-neutral-800 sticky top-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-2">
        <div className="hidden md:flex items-center gap-2 text-white">
          <Icon icon="solar:shuriken-linear" width="24" strokeWidth="1.5" aria-hidden="true" />
          <span className="font-medium tracking-tight text-lg">
            SHINOBI<span className="text-neutral-600">BUILD</span>
          </span>
        </div>
        <nav
          className="flex items-center gap-1 flex-1 justify-center md:justify-start"
          role="navigation"
          aria-label={t('ariaLabel')}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-2 sm:px-4 py-2 text-xs font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  isActive
                    ? "text-white bg-neutral-900"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-900/50",
                )}
                aria-label={t(item.ariaLabelKey)}
                aria-current={isActive ? "page" : undefined}
              >
                {t(item.nameKey).toUpperCase()}
              </Link>
            );
          })}
        </nav>
        <div className="flex md:block">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
});
