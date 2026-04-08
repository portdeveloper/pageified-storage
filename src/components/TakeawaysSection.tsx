"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";
import { useLanguage } from "@/i18n/LanguageContext";

const CARD_STYLES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    titleKey: "mip8.takeaways.card1Title",
    descKey: "mip8.takeaways.card1Desc",
    color: "text-solution-accent",
    bg: "bg-solution-bg",
    border: "border-solution-accent-light",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="8" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 15L21 9M11 17L21 23" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    titleKey: "mip8.takeaways.card2Title",
    descKey: "mip8.takeaways.card2Desc",
    color: "text-text-primary",
    bg: "bg-surface-elevated",
    border: "border-border",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 24V12L16 4L24 12V24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 28H28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 24V18H19V24" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    titleKey: "mip8.takeaways.card3Title",
    descKey: "mip8.takeaways.card3Desc",
    color: "text-solution-accent",
    bg: "bg-solution-bg",
    border: "border-solution-accent-light",
  },
];

export default function TakeawaysSection() {
  const { t } = useLanguage();
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-solution-bg relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-10">
          {t("mip8.takeaways.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CARD_STYLES.map((card, i) => (
            <motion.div
              key={card.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`${card.bg} rounded-xl border ${card.border} p-6 flex flex-col`}
            >
              <div className={`${card.color} mb-4`}>{card.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{t(card.titleKey)}</h3>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                {t(card.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
