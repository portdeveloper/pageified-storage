"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

const COLS = 16;
const ROWS = 8;
const TOTAL = COLS * ROWS;

export default function HeroSection() {
  const { t } = useLanguage();
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showPage, setShowPage] = useState(false);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout> | undefined;
    let t2: ReturnType<typeof setTimeout> | undefined;
    let t3: ReturnType<typeof setTimeout> | undefined;

    const runCycle = () => {
      t1 = setTimeout(() => setActiveSlot(17), 600);
      t2 = setTimeout(() => setShowPage(true), 1200);
      t3 = setTimeout(() => {
        setActiveSlot(null);
        setShowPage(false);
        runCycle();
      }, 3500);
    };

    runCycle();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl relative z-10 mt-30"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-6">
          {t("mip8.hero.title1")}{" "}
          <span className="font-semibold italic">{t("mip8.hero.titleHighlight")}</span>{" "}
          {t("mip8.hero.title2")}
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light max-w-xl mx-auto leading-relaxed">
          {t("mip8.hero.desc1")}
          <br />
          {t("mip8.hero.desc2")}
        </p>
      </motion.div>

      {/* Animated page grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 mb-16 relative z-10"
      >
        <div className="bg-surface-elevated rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-problem-accent" />
            <p className="font-mono text-[11px] text-text-tertiary">
              {activeSlot !== null ? `${t("mip8.hero.sloadSlot")} ${activeSlot}` : t("mip8.hero.waiting")}
              {showPage && (
                <span className="text-solution-accent ml-2">
                  {t("mip8.hero.pageFetch")}
                </span>
              )}
            </p>
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: TOTAL }, (_, i) => {
              const isActive = i === activeSlot;
              const isWarmed = showPage;

              return (
                <motion.div
                  key={i}
                  className="aspect-square rounded-sm"
                  animate={{
                    backgroundColor: isActive
                      ? "#c4653a"
                      : isWarmed
                      ? "#c8e6df"
                      : "#e8e2da",
                  }}
                  transition={{
                    delay: isWarmed && !isActive ? (i * 0.003) : 0,
                    duration: 0.3,
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-4 mt-3">
            <p className="font-mono text-xs text-text-tertiary">
              {t("mip8.hero.formula")}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: showPage ? 1 : 0 }}
              className="font-mono text-xs text-problem-accent text-right"
            >
              {t("mip8.hero.siblingNote")}
            </motion.p>
          </div>
        </div>
      </motion.div>

    </section>
  );
}
