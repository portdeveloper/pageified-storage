"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useInView } from "../useInView";

function ethMemoryCost(bytes: number): number {
  const words = Math.ceil(bytes / 32);
  return Math.floor((words * words) / 512) + 3 * words;
}

function mip3MemoryCost(bytes: number): number {
  const words = Math.ceil(bytes / 32);
  return Math.floor(words / 2);
}

interface Scenario {
  name: string;
  description: string;
  bytes: number;
  ethNote?: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Typical usage (2 KB)",
    description:
      "Average memory usage observed on Ethereum mainnet. ABI encoding a few parameters.",
    bytes: 2 * 1024,
  },
  {
    name: "ABI-encode a struct (1 KB)",
    description: "Encoding a moderately sized struct for a cross-contract call.",
    bytes: 1024,
  },
  {
    name: "Batch process 100 txs (100 KB)",
    description:
      "Building a 100 KB buffer to process a batch of transactions in one call.",
    bytes: 100 * 1024,
  },
  {
    name: "On-chain data processing (1 MB)",
    description:
      "Decompressing, sorting, or transforming a large dataset in a single transaction.",
    bytes: 1_048_576,
  },
  {
    name: "Full 8 MB allocation",
    description:
      "Maximum memory under MIP-3. Enables large proof verification buffers, rollup batch processing.",
    bytes: 8 * 1024 * 1024,
    ethNote: "Exceeds 30M gas block limit",
  },
];

export default function Mip3GasCalculatorSection() {
  const { ref, isVisible } = useInView(0.1);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const scenario = SCENARIOS[selectedIdx];

  const ethGas = ethMemoryCost(scenario.bytes);
  const mip3Gas = mip3MemoryCost(scenario.bytes);
  const ethImpossible = ethGas > 30_000_000;
  const savings = !ethImpossible
    ? Math.round(((ethGas - mip3Gas) / ethGas) * 100)
    : null;
  const ratio = mip3Gas > 0 ? ethGas / mip3Gas : Infinity;

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Compare the cost
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          Select a scenario to see the memory expansion gas under the current
          quadratic model versus MIP-3&apos;s linear model.
        </p>

        {/* Scenario picker */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        <p className="text-sm text-text-secondary mb-6 font-light">
          {scenario.description}
        </p>

        {/* Side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Quadratic */}
          <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-6">
            <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-4">
              Quadratic (ETH)
            </p>
            <motion.p
              key={`eth-${selectedIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-4xl font-semibold text-problem-accent tabular-nums mb-2"
            >
              {ethImpossible ? "IMPOSSIBLE" : ethGas.toLocaleString()}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary">
              {ethImpossible ? scenario.ethNote : "gas"}
            </p>
            <div className="mt-4 pt-4 border-t border-problem-cell-hover">
              <p className="font-mono text-xs text-text-secondary">
                words&sup2;/512 + 3 * words
              </p>
              <p className="font-mono text-xs text-text-tertiary mt-1">
                {Math.ceil(scenario.bytes / 32).toLocaleString()} words
              </p>
            </div>
          </div>

          {/* Linear */}
          <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-6">
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-4">
              Linear (MIP-3)
            </p>
            <motion.p
              key={`mip3-${selectedIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-4xl font-semibold text-solution-accent tabular-nums mb-2"
            >
              {mip3Gas.toLocaleString()}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary">gas</p>
            <div className="mt-4 pt-4 border-t border-solution-accent-light">
              <p className="font-mono text-xs text-text-secondary">
                words / 2
              </p>
              <p className="font-mono text-xs text-text-tertiary mt-1">
                {Math.ceil(scenario.bytes / 32).toLocaleString()} words
              </p>
            </div>
          </div>
        </div>

        {/* Savings bar */}
        <div className="bg-surface-elevated rounded-lg border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-xs text-text-tertiary">
              Memory expansion savings
            </p>
            {ethImpossible ? (
              <p className="font-mono text-lg font-semibold text-solution-accent">
                Only possible with MIP-3
              </p>
            ) : (
              <motion.p
                key={savings}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-mono text-lg font-semibold text-solution-accent"
              >
                {ratio.toFixed(ratio >= 100 ? 0 : 1)}x cheaper
              </motion.p>
            )}
          </div>
          {!ethImpossible && (
            <>
              <div className="w-full h-3 bg-problem-cell rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(mip3Gas / ethGas) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-solution-accent rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1 font-mono text-xs text-text-tertiary">
                <span>MIP-3: {mip3Gas.toLocaleString()}</span>
                <span>Quadratic: {ethGas.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
