"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useInView } from "../useInView";
import { useLanguage } from "@/i18n/LanguageContext";

const CARD_STYLES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 24L16 8L28 24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 24H28" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    titleKey: "mip3.takeaways.card1Title",
    descKey: "mip3.takeaways.card1Desc",
    color: "text-solution-accent",
    bg: "bg-solution-bg",
    border: "border-solution-accent-light",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 14H28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 8V24" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    titleKey: "mip3.takeaways.card2Title",
    descKey: "mip3.takeaways.card2Desc",
    color: "text-solution-accent",
    bg: "bg-solution-bg",
    border: "border-solution-accent-light",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="4" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="14" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="24" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 12V14" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 22V24" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    titleKey: "mip3.takeaways.card3Title",
    descKey: "mip3.takeaways.card3Desc",
    color: "text-text-primary",
    bg: "bg-surface-elevated",
    border: "border-border",
  },
];

export default function Mip3TakeawaysSection() {
  const { t } = useLanguage();
  const { ref, isVisible } = useInView(0.1);

  const cards = useMemo(() =>
    CARD_STYLES.map((card) => ({
      ...card,
      title: t(card.titleKey),
      description: t(card.descKey),
    })),
    [t]
  );

  return (
    <section ref={ref} className="py-24 px-6 bg-solution-bg relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-10">
          {t("mip3.takeaways.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`${card.bg} rounded-xl border ${card.border} p-6 flex flex-col`}
            >
              <div className={`${card.color} mb-4`}>{card.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
