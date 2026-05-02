"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import SpecDisclaimer from "@/components/SpecDisclaimer";

const RESERVE_MON = 10;

export default function Mip4HeroSection() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const BALANCE_STEPS = [
    { balance: 25, label: t("mip4.hero.step1"), phase: "ok" },
    { balance: 18, label: t("mip4.hero.step2"), phase: "ok" },
    { balance: 8, label: t("mip4.hero.step3"), phase: "violation" },
    { balance: 8, label: t("mip4.hero.step4"), phase: "detect" },
    { balance: 18, label: t("mip4.hero.step5"), phase: "recover" },
    { balance: 18, label: t("mip4.hero.step6"), phase: "ok" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setRunning(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (step >= BALANCE_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setStep(0);
        setRunning(false);
        setTimeout(() => setRunning(true), 800);
      }, 3000);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(timer);
  }, [step, running, BALANCE_STEPS.length]);

  const current = BALANCE_STEPS[step];
  const barHeight = Math.min(100, (current.balance / 30) * 100);
  const reserveLinePos = (RESERVE_MON / 30) * 100;
  const isViolation = current.phase === "violation" || current.phase === "detect";

  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl relative z-10 mt-30"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-6">
          {t("mip4.hero.title1")}{" "}
          <span className="font-semibold italic">{t("mip4.hero.titleHighlight")}</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light max-w-xl mx-auto leading-relaxed">
          {t("mip4.hero.desc")}
        </p>
        <SpecDisclaimer />
      </motion.div>

      {/* Animated balance visualization */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 mb-16 relative z-10 w-full max-w-lg"
      >
        <div className="bg-surface-elevated rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-end gap-6">
            {/* Balance bar */}
            <div className="flex-1 relative">
              <div className="w-full h-48 bg-border/20 rounded-lg relative overflow-hidden">
                {/* Reserve line */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-problem-accent z-10"
                  style={{ bottom: `${reserveLinePos}%` }}
                >
                  <span className="absolute left-2 sm:left-auto sm:right-0 -top-5 font-mono text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                    {t("mip4.hero.reserve")}
                  </span>
                </div>

                {/* Balance fill */}
                <motion.div
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${
                    isViolation ? "bg-problem-accent" : "bg-solution-accent"
                  }`}
                />
              </div>
            </div>

            {/* Info */}
            <div className="w-48 pb-2">
              <motion.p
                key={current.balance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`font-mono text-4xl font-semibold tabular-nums mb-1 ${
                  isViolation ? "text-problem-accent" : "text-solution-accent"
                }`}
              >
                {current.balance}
              </motion.p>
              <p className="font-mono text-xs text-text-tertiary mb-4">{t("mip4.hero.monBalance")}</p>

              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`font-mono text-xs p-2 rounded-md ${
                  current.phase === "detect"
                    ? "bg-problem-bg text-problem-accent"
                    : current.phase === "recover"
                    ? "bg-solution-bg text-solution-accent"
                    : current.phase === "violation"
                    ? "bg-problem-bg text-problem-accent"
                    : "bg-surface text-text-secondary"
                }`}
              >
                {current.label}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
