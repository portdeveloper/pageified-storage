"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useInView } from "./useInView";

const COLS = 16;
const ROWS = 8;
const TOTAL = COLS * ROWS;

// Illustrative worst case: 4 related fields lose backend locality
const PAGES = [
  { label: "Backend page 0x7a2f...", slot: 17 },
  { label: "Backend page 0x3e81...", slot: 94 },
  { label: "Backend page 0xb4c5...", slot: 42 },
  { label: "Backend page 0x91d7...", slot: 109 },
];

const FIELD_NAMES = ["owner", "balance", "timestamp", "approved"];
const COLD_COST = 8100;

export default function ProblemSection() {
  const { ref, isVisible } = useInView(0.1);
  const [loadedSlots, setLoadedSlots] = useState<number[]>([]);
  const [gasUsed, setGasUsed] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleLoad = (pageIndex: number) => {
    if (loadedSlots.includes(pageIndex)) return;
    setLoadedSlots((prev) => [...prev, pageIndex]);
    setGasUsed((prev) => prev + COLD_COST);
    setLastAction(
      `SLOAD ${FIELD_NAMES[pageIndex]} → cold read (${COLD_COST} gas)`
    );
  };

  const reset = () => {
    setLoadedSlots([]);
    setGasUsed(0);
    setLastAction(null);
  };

  return (
    <section
      ref={ref}
      className="min-h-screen py-24 px-6 bg-problem-bg relative"
    >
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-problem-muted uppercase mb-3">
          Current EVM
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Hashing destroys locality
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-2xl leading-relaxed mb-4">
          Ethereum&apos;s trie/database path hashes storage keys, so logically
          contiguous slots lose backend locality. In a worst-case pattern like
          this illustration, four related fields can end up on four different
          backend pages even though they are adjacent in Solidity.
        </p>

        {/* Struct definition */}
        <div className="bg-surface-elevated rounded-lg border border-border p-4 mb-8 max-w-sm font-mono text-sm">
          <p className="text-text-tertiary text-xs mb-2">
            {"// Solidity struct"}
          </p>
          <p className="text-problem-accent">struct Token {"{"}</p>
          {FIELD_NAMES.map((name, i) => (
            <p key={name} className="ml-4">
              <span className="text-text-tertiary">slot {i}:</span>{" "}
              <span
                className={
                  loadedSlots.includes(i)
                    ? "text-problem-accent font-semibold"
                    : "text-text-primary"
                }
              >
                {name}
              </span>
            </p>
          ))}
          <p className="text-problem-accent">{"}"}</p>
        </div>

        {/* Interactive buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FIELD_NAMES.map((name, i) => (
            <button
              key={name}
              onClick={() => handleLoad(i)}
              disabled={loadedSlots.includes(i)}
              className={`font-mono text-sm px-4 py-2 rounded-md border transition-all ${
                loadedSlots.includes(i)
                  ? "bg-problem-accent text-white border-problem-accent cursor-default"
                  : "bg-surface-elevated border-border hover:border-problem-accent hover:text-problem-accent cursor-pointer"
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
              className="font-mono text-sm text-problem-accent mb-6"
            >
              → {lastAction}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4 page grids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {PAGES.map((page, pageIndex) => {
            const isLoaded = loadedSlots.includes(pageIndex);
            return (
              <div
                key={page.label}
                className={`bg-surface-elevated rounded-lg p-3 border transition-all duration-300 ${
                  isLoaded
                    ? "border-problem-accent shadow-md"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isLoaded && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-problem-accent"
                    />
                  )}
                  <p className="font-mono text-[10px] text-text-tertiary">
                    {page.label}
                  </p>
                </div>
                <div
                  className="grid gap-[2px]"
                  style={{
                    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: TOTAL }, (_, i) => {
                    const isTarget = i === page.slot;
                    return (
                      <div
                        key={i}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[2px] transition-colors duration-300 ${
                          isTarget && isLoaded
                            ? "bg-problem-accent"
                            : isTarget
                            ? "bg-problem-cell-hover"
                            : "bg-problem-cell"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Gas counter */}
        <div className="flex items-center gap-6 p-4 bg-surface-elevated rounded-lg border border-border">
          <div>
            <p className="font-mono text-xs text-text-tertiary">Total gas</p>
            <motion.p
              key={gasUsed}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="font-mono text-3xl font-semibold text-problem-accent tabular-nums"
            >
              {gasUsed.toLocaleString()}
            </motion.p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="font-mono text-xs text-text-tertiary">Cold reads</p>
            <p className="font-mono text-3xl font-semibold text-text-primary tabular-nums">
              {loadedSlots.length}
            </p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="font-mono text-xs text-text-tertiary">Pages loaded</p>
            <p className="font-mono text-3xl font-semibold text-text-primary tabular-nums">
              {loadedSlots.length}
            </p>
          </div>
          {loadedSlots.length === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="ml-auto"
            >
              <p className="font-mono text-xs text-problem-accent font-semibold">
                In this illustration: 4 fields = 4 pages = 4 cold reads
              </p>
              <p className="font-mono text-[10px] text-text-tertiary">
                128x more data touched than returned
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
