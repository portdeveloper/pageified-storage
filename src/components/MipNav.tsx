"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageContext";

const TABS = [
  { name: "MIP-8", href: "/mip-8", ready: true, beta: false },
  { name: "MIP-3", href: "/mip-3", ready: true, beta: true },
  { name: "MIP-4", href: "/mip-4", ready: true, beta: true },
  { name: "MIP-7", href: "/mip-7", ready: true, beta: true },
];

export default function MipNav() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-surface-elevated/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-stretch h-14 gap-3 sm:gap-6">
        <Link
          href="/"
          className="font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors whitespace-nowrap flex-shrink-0 inline-flex items-center"
        >
          {t("nav.brand")}
        </Link>
        <div className="flex items-stretch gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`inline-flex items-center font-mono text-xs px-3 py-2 rounded-md transition-all whitespace-nowrap flex-shrink-0 min-h-11 ${
                  isActive
                    ? "bg-text-primary text-surface"
                    : tab.ready
                    ? "text-text-secondary hover:text-text-primary hover:bg-surface"
                    : "text-text-tertiary cursor-default"
                }`}
              >
                {tab.name}
                {!tab.ready && (
                  <span className="ml-1.5 text-[10px] opacity-50">{t("nav.soon")}</span>
                )}
                {tab.beta && (
                  <span className="ml-1.5 text-[10px] opacity-50">{t("nav.beta")}</span>
                )}
              </Link>
            );
          })}
        </div>
        <button
          onClick={() => setLocale(locale === "en" ? "zh" : "en")}
          className="inline-flex items-center justify-center font-mono text-xs px-3 py-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface transition-all whitespace-nowrap flex-shrink-0 min-w-11 min-h-11"
        >
          {locale === "en" ? "中文" : "EN"}
        </button>
      </div>
    </nav>
  );
}
