"use client";

import { motion } from "framer-motion";
import { useInView } from "../useInView";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Mip7TakeawaysSection() {
  const { t } = useLanguage();
  const { ref, isVisible } = useInView(0.1);

  const CARDS = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
          <path d="M19 12h4M19 16h4M9 19h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: t("mip7.takeaways.card1Title"),
      description: t("mip7.takeaways.card1Desc"),
      color: "text-solution-accent",
      bg: "bg-solution-bg",
      border: "border-solution-accent-light",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 10v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: t("mip7.takeaways.card2Title"),
      description: t("mip7.takeaways.card2Desc"),
      color: "text-solution-accent",
      bg: "bg-solution-bg",
      border: "border-solution-accent-light",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4v6M16 22v6M4 16h6M22 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="2" fill="currentColor" />
        </svg>
      ),
      title: t("mip7.takeaways.card3Title"),
      description: t("mip7.takeaways.card3Desc"),
      color: "text-text-primary",
      bg: "bg-surface-elevated",
      border: "border-border",
    },
  ];

  return (
    <section ref={ref} className="py-24 px-6 bg-solution-bg relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-10">
          {t("mip7.takeaways.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
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
