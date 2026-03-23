"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLS = 16;
const ROWS = 8;
const TOTAL = COLS * ROWS;

export default function HeroSection() {
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
    <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
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
        className="text-center max-w-3xl relative z-10"
      >
        <p className="font-mono text-xs tracking-[0.2em] text-text-tertiary uppercase mb-6">
          MIP-8
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-6">
          What if your storage model{" "}
          <span className="font-semibold italic">matched</span>{" "}
          your hardware?
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light max-w-xl mx-auto leading-relaxed">
          You ask for 32 bytes. The storage engine may still touch 4,096.
          <br />
          MIP-8 makes the EVM account for that page-sized reality.
        </p>
      </motion.div>

      {/* Animated page grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 relative z-10"
      >
        <div className="bg-surface-elevated rounded-xl p-5 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-problem-accent" />
            <p className="font-mono text-[11px] text-text-tertiary">
              {activeSlot !== null ? `SLOAD slot ${activeSlot}` : "waiting..."}
              {showPage && (
                <span className="text-solution-accent ml-2">
                  - backend may fetch an entire 4KB page
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

              let bg = "bg-[#e8e2da]";
              if (isActive) bg = "bg-problem-accent";
              else if (isWarmed) bg = "bg-solution-accent-light";

              return (
                <motion.div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${bg}`}
                  animate={{
                    backgroundColor: isActive
                      ? undefined
                      : isWarmed
                      ? undefined
                      : undefined,
                  }}
                  transition={{
                    delay: isWarmed && !isActive ? (i * 0.003) : 0,
                    duration: 0.3,
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="font-mono text-[10px] text-text-tertiary">
              128 slots × 32 bytes = 4,096 bytes = 1 page
            </p>
            {showPage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[10px] text-problem-accent"
              >
                127 sibling slots stay unused in this example
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-8 h-12 rounded-full border-2 border-text-tertiary/30 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-text-tertiary/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
