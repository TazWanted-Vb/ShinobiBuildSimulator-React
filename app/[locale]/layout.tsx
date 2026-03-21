import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { fetchNinjas, fetchProperties } from "@/lib/api";
import { FormationProvider } from "@/components/providers/formation-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkillsPopoverProvider } from "@/components/formation/skills-popover-context";
import { GlobalSkillsPopover } from "@/components/formation/global-skills-popover";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const ninjas = await fetchNinjas(locale);
  const properties = await fetchProperties(locale);

  // Load messages for the current locale
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <ToastProvider>
          <FormationProvider initialNinjas={ninjas || []} initialProperties={properties || []}>
            <SkillsPopoverProvider>
              <GlobalSkillsPopover />
              {children}
            </SkillsPopoverProvider>
          </FormationProvider>
        </ToastProvider>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
