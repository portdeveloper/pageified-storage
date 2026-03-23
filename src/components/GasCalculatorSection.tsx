"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useInView } from "./useInView";

interface Scenario {
  name: string;
  description: string;
  currentGas: number;
  mip8Gas: number;
  currentBreakdown: string;
  mip8Breakdown: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Read 4 struct fields",
    description: "Loading owner, balance, timestamp, approved from a Token struct",
    currentGas: 8400,
    mip8Gas: 2400,
    currentBreakdown: "4 × 2,100 (cold SLOAD)",
    mip8Breakdown: "1 × 2,100 (cold) + 3 × 100 (warm)",
  },
  {
    name: "Read 8 array entries",
    description: "Iterating over 8 consecutive array slots (e.g. an order book)",
    currentGas: 16800,
    mip8Gas: 2800,
    currentBreakdown: "8 × 2,100 (cold SLOAD — scattered by MPT)",
    mip8Breakdown: "1 × 2,100 (cold) + 7 × 100 (warm — same page)",
  },
  {
    name: "Read 8 mapping entries",
    description: "Looking up 8 different mapping keys (random pages)",
    currentGas: 16800,
    mip8Gas: 16800,
    currentBreakdown: "8 × 2,100 (cold SLOAD)",
    mip8Breakdown: "8 × 2,100 (cold) — different pages",
  },
  {
    name: "Read ERC-20 transfer data",
    description:
      "sender balance, receiver balance, allowance — 3 mapping lookups, 3 different pages",
    currentGas: 6300,
    mip8Gas: 6300,
    currentBreakdown: "3 × 2,100 (cold SLOAD)",
    mip8Breakdown: "3 × 2,100 (cold) — mappings hash to separate pages",
  },
  {
    name: "Initialize new struct (5 slots)",
    description:
      "First write to 5 contiguous slots — state growth cost dominates",
    currentGas: 110500,
    mip8Gas: 110500,
    currentBreakdown: "5 × 22,100 (20,000 + 2,100 cold)",
    mip8Breakdown: "5 × 22,100 — state growth cost dominates",
  },
];

export default function GasCalculatorSection() {
  const { ref, isVisible } = useInView(0.1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const scenario = SCENARIOS[selectedIdx];

  const savings = Math.round(
    ((scenario.currentGas - scenario.mip8Gas) / scenario.currentGas) * 100
  );

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-4xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-text-tertiary uppercase mb-3">
          Gas economics
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Compare the cost
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-2xl leading-relaxed mb-2">
          Select a scenario to see the gas breakdown under current EVM rules
          versus MIP-8&apos;s page-aware model.
        </p>
        <p className="text-sm text-text-tertiary font-light max-w-2xl leading-relaxed mb-10">
          These examples use today&apos;s EIP-2929 read constants for illustration
          (2,100 cold / 100 warm) and assume the accessed run fits in one page.
          MIP-8 defines abstract cost parameters, so final protocol values may
          differ.
        </p>

        {/* Scenario picker */}
        <div className="flex flex-wrap gap-2 mb-8">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSelectedIdx(i)}
              className={`font-mono text-xs px-3 py-2 rounded-md border transition-all cursor-pointer ${
                i === selectedIdx
                  ? "bg-text-primary text-surface border-text-primary"
                  : "bg-surface-elevated border-border hover:border-text-secondary"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary mb-6 font-light">
          {scenario.description}
        </p>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Current EVM */}
          <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-6">
            <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-4">
              Current EVM
            </p>
            <motion.p
              key={`current-${selectedIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-4xl font-semibold text-problem-accent tabular-nums mb-2"
            >
              {scenario.currentGas.toLocaleString()}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary">gas</p>
            <div className="mt-4 pt-4 border-t border-problem-cell-hover">
              <p className="font-mono text-xs text-text-secondary">
                {scenario.currentBreakdown}
              </p>
            </div>
          </div>

          {/* MIP-8 */}
          <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-6">
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-4">
              MIP-8
            </p>
            <motion.p
              key={`mip8-${selectedIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-4xl font-semibold text-solution-accent tabular-nums mb-2"
            >
              {scenario.mip8Gas.toLocaleString()}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary">gas</p>
            <div className="mt-4 pt-4 border-t border-solution-accent-light">
              <p className="font-mono text-xs text-text-secondary">
                {scenario.mip8Breakdown}
              </p>
            </div>
          </div>
        </div>

        {/* Savings bar */}
        <div className="bg-surface-elevated rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-text-tertiary">Gas savings</p>
            <motion.p
              key={savings}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={`font-mono text-lg font-semibold ${
                savings > 0 ? "text-solution-accent" : "text-text-tertiary"
              }`}
            >
              {savings > 0 ? `${savings}% cheaper` : "No change"}
            </motion.p>
          </div>
          <div className="w-full h-3 bg-problem-cell rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - savings}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-solution-accent rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1 font-mono text-[10px] text-text-tertiary">
            <span>MIP-8</span>
            <span>Current EVM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
