"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useInView } from "./useInView";

const COLS = 16;
const ROWS = 8;
const TOTAL = COLS * ROWS;

const FIELD_NAMES = ["owner", "balance", "timestamp", "approved"];
const COLD_COST = 8100;
const WARM_COST = 100;

export default function SolutionSection() {
  const { ref, isVisible } = useInView(0.1);
  const [loadedSlots, setLoadedSlots] = useState<number[]>([]);
  const [pageWarmed, setPageWarmed] = useState(false);
  const [gasUsed, setGasUsed] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleLoad = (fieldIndex: number) => {
    if (loadedSlots.includes(fieldIndex)) return;

    if (!pageWarmed) {
      setPageWarmed(true);
      setGasUsed((prev) => prev + COLD_COST);
      setLastAction(
        `SLOAD ${FIELD_NAMES[fieldIndex]} → cold read (${COLD_COST} gas), page warmed!`
      );
    } else {
      setGasUsed((prev) => prev + WARM_COST);
      setLastAction(
        `SLOAD ${FIELD_NAMES[fieldIndex]} → warm read (${WARM_COST} gas)`
      );
    }
    setLoadedSlots((prev) => [...prev, fieldIndex]);
  };

  const reset = () => {
    setLoadedSlots([]);
    setPageWarmed(false);
    setGasUsed(0);
    setLastAction(null);
  };

  return (
    <section
      ref={ref}
      className="min-h-screen py-24 px-6 bg-solution-bg relative"
    >
      <div
        className={`max-w-4xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-solution-muted uppercase mb-3">
          MIP-8
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          One page touch warms 128 slots
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-2xl leading-relaxed mb-4">
          MIP-8 groups 128 consecutive slots into a page. Touch one slot, and
          the rest of that page becomes warm for the transaction. This demo uses
          Monad&apos;s 8,100/100 cold-vs-warm read constants for illustration.
        </p>

        {/* Interactive buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FIELD_NAMES.map((name, i) => (
            <button
              key={name}
              onClick={() => handleLoad(i)}
              disabled={loadedSlots.includes(i)}
              className={`font-mono text-sm px-4 py-2 rounded-md border transition-all ${
                loadedSlots.includes(i)
                  ? "bg-solution-accent text-white border-solution-accent cursor-default"
                  : "bg-surface-elevated border-border hover:border-solution-accent hover:text-solution-accent cursor-pointer"
              }`}
            >
              SLOAD {name}
            </button>
          ))}
          {loadedSlots.length > 0 && (
            <button
              onClick={reset}
              className="font-mono text-xs px-3 py-2 rounded-md text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              reset
            </button>
          )}
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {lastAction && (
            <motion.div
              key={lastAction}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="font-mono text-sm text-solution-accent mb-6"
            >
              → {lastAction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single page grid */}
        <div
          className={`bg-surface-elevated rounded-lg p-4 border-2 border-dashed transition-all duration-500 mb-8 ${
            pageWarmed ? "border-solution-accent" : "border-border"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <p className="font-mono text-xs text-text-tertiary">
              Example page - contiguous fields fit here
            </p>
            {pageWarmed && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-solution-accent text-white"
              >
                WARM
              </motion.span>
            )}
          </div>
          <div
            className="grid gap-[3px]"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: TOTAL }, (_, i) => {
              const isField = i < 4;
              const fieldLoaded = isField && loadedSlots.includes(i);

              let bg = "bg-solution-cell";
              if (fieldLoaded) bg = "bg-solution-accent";
              else if (isField && pageWarmed) bg = "bg-solution-accent-light";
              else if (pageWarmed) bg = "bg-solution-accent-light/50";

              return (
                <motion.div
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${bg}`}
                  animate={{ backgroundColor: undefined }}
                  transition={{
                    delay: pageWarmed ? i * 0.002 : 0,
                    duration: 0.3,
                  }}
                />
              );
            })}
          </div>
          <p className="font-mono text-[10px] text-text-tertiary mt-2">
            {pageWarmed
              ? "All 128 slots are warm for this transaction - in this example, subsequent reads use the 100-gas warm cost"
              : "Click a slot, watch the whole page warm up"}
          </p>
        </div>

        {/* Gas counter + comparison */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-surface-elevated rounded-lg border border-border">
          <div>
            <p className="font-mono text-xs text-text-tertiary">Total gas</p>
            <motion.p
              key={gasUsed}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-mono text-3xl font-semibold text-solution-accent tabular-nums"
            >
              {gasUsed.toLocaleString()}
            </motion.p>
          </div>
          <div className="hidden sm:block h-10 w-px bg-border" />
          <div>
            <p className="font-mono text-xs text-text-tertiary">Cold reads</p>
            <p className="font-mono text-3xl font-semibold text-text-primary tabular-nums">
              {pageWarmed ? 1 : 0}
            </p>
          </div>
          <div className="hidden sm:block h-10 w-px bg-border" />
          <div>
            <p className="font-mono text-xs text-text-tertiary">Warm reads</p>
            <p className="font-mono text-3xl font-semibold text-text-primary tabular-nums">
              {Math.max(0, loadedSlots.length - (pageWarmed ? 1 : 0))}
            </p>
          </div>

          {loadedSlots.length === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sm:ml-auto"
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-mono text-xs text-problem-accent line-through">
                    32,400 gas
                  </p>
                  <p className="font-mono text-xs text-text-tertiary">
                    Current EVM
                  </p>
                </div>
                <span className="text-text-tertiary">→</span>
                <div>
                  <p className="font-mono text-xs text-solution-accent font-semibold">
                    8,400 gas
                  </p>
                  <p className="font-mono text-xs text-text-tertiary">MIP-8 example</p>
                </div>
                <div className="px-2 py-1 rounded-md bg-solution-accent-light">
                  <p className="font-mono text-sm font-semibold text-solution-accent">
                    74% cheaper here
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
