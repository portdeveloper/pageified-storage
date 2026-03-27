"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import { useInView } from "./useInView";
import {
  analyzeSource,
  analyzeGithub,
  groupByPage,
  calculateGas,
  type StorageVar,
  type CompilationResult,
  type ContractResult,
} from "./analyzer/solc-utils";

function isMapping(type: string): boolean {
  return type.startsWith("mapping(");
}

export default function AnalyzerSection() {
  const { ref, isVisible } = useInView(0.1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [selectedContract, setSelectedContract] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

  const contract: ContractResult | null =
    result?.contracts?.[selectedContract] ?? null;

  const handleAnalyze = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    setSelectedSlots(new Set());
    setSelectedContract(0);
    try {
      const isGithub = input.trim().includes("github.com");
      const res = isGithub
        ? await analyzeGithub(input.trim())
        : await analyzeSource(input.trim());
      setResult(res);
      const first = res.contracts?.find((c) => c.storageLayout.length > 0);
      if (first) {
        const idx = res.contracts!.indexOf(first);
        setSelectedContract(idx);
        setSelectedSlots(
          new Set(
            first.storageLayout
              .filter((v) => !isMapping(v.type))
              .map((v) => v.slot)
          )
        );
      }
    } catch {
      setResult({ success: false, errors: ["Failed to connect to analyzer service"] });
    }
    setLoading(false);
  }, [input]);

  const handleSelectContract = useCallback(
    (idx: number) => {
      setSelectedContract(idx);
      const c = result?.contracts?.[idx];
      if (c) {
        setSelectedSlots(
          new Set(c.storageLayout.filter((v) => !isMapping(v.type)).map((v) => v.slot))
        );
      }
    },
    [result]
  );

  const toggleSlot = useCallback((slot: number) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }, []);

  const selectedVars = useMemo(
    () => contract?.storageLayout.filter((v) => selectedSlots.has(v.slot)) ?? [],
    [contract, selectedSlots]
  );
  const gas = useMemo(() => calculateGas(selectedVars), [selectedVars]);
  const uniqueSlots = useMemo(() => new Set(selectedVars.map((v) => v.slot)).size, [selectedVars]);
  const uniquePages = useMemo(() => new Set(selectedVars.map((v) => v.page)).size, [selectedVars]);
  const pages = useMemo(() => (contract ? groupByPage(contract.storageLayout) : new Map()), [contract]);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-elevated relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Try your own contract
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-2">
          Paste a GitHub repo URL or Solidity source to see how your contract&apos;s
          storage layout maps to pages.
        </p>
        <p className="text-sm text-text-tertiary font-light mb-8">
          Supports GitHub repo URLs and single-file Solidity source.
        </p>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="https://github.com/Uniswap/v2-core or paste Solidity source"
            className="flex-1 font-mono text-xs bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-text-secondary"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className={`font-mono text-xs px-5 py-3 rounded-lg border transition-all shrink-0 ${
              loading || !input.trim()
                ? "bg-surface border-border text-text-tertiary cursor-default"
                : "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
            }`}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* Errors */}
        <AnimatePresence>
          {result && !result.success && result.errors && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-problem-bg border border-problem-cell-hover mb-6"
            >
              {result.errors.map((err, i) => (
                <pre key={i} className="font-mono text-xs text-problem-accent whitespace-pre-wrap">{err}</pre>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result?.success && result.contracts && contract && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Contract picker */}
            {result.contracts.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {result.contracts.map((c, i) => (
                  <button
                    key={`${c.name}-${i}`}
                    onClick={() => handleSelectContract(i)}
                    className={`font-mono text-xs px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                      i === selectedContract
                        ? "bg-text-primary text-surface border-text-primary"
                        : "bg-surface border-border hover:border-text-secondary"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Layout */}
              <div className="lg:col-span-2 space-y-3">
                {Array.from(pages.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([pageNum, vars]: [number, StorageVar[]]) => (
                    <div
                      key={pageNum}
                      className={`rounded-lg border p-3 transition-all ${
                        vars.some((v) => selectedSlots.has(v.slot))
                          ? "bg-solution-bg border-solution-accent-light"
                          : "bg-surface border-border"
                      }`}
                    >
                      <p className="font-mono text-xs font-semibold mb-2">
                        Page {pageNum}
                      </p>
                      <div className="space-y-0.5">
                        {vars.map((v) => {
                          const mapping = isMapping(v.type);
                          return (
                            <label
                              key={`${v.slot}-${v.label}`}
                              className={`flex items-center gap-2 py-0.5 px-1 rounded cursor-pointer text-xs font-mono ${
                                mapping ? "opacity-50" : "hover:bg-surface-elevated"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedSlots.has(v.slot)}
                                onChange={() => toggleSlot(v.slot)}
                                className="accent-solution-accent"
                              />
                              <span className="text-text-tertiary w-10 tabular-nums">s{v.slot}</span>
                              <span className={selectedSlots.has(v.slot) && !mapping ? "text-solution-accent font-semibold" : "text-text-primary"}>
                                {v.label}
                              </span>
                              {mapping && <span className="text-problem-muted ml-auto">scattered</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Gas sidebar */}
              <div className="space-y-3">
                <div className="bg-problem-bg rounded-lg border border-problem-cell-hover p-4">
                  <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-2">Monad (current)</p>
                  <p className="font-mono text-2xl font-semibold text-problem-accent tabular-nums">{gas.currentGas.toLocaleString()}</p>
                  <p className="font-mono text-xs text-text-tertiary">{uniqueSlots} x 8,100</p>
                </div>

                <div className="bg-solution-bg rounded-lg border border-solution-accent-light p-4">
                  <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-2">MIP-8</p>
                  <p className="font-mono text-2xl font-semibold text-solution-accent tabular-nums">{gas.mip8Gas.toLocaleString()}</p>
                  <p className="font-mono text-xs text-text-tertiary">{uniquePages} x 8,100 + {Math.max(0, uniqueSlots - uniquePages)} x 100</p>
                </div>

                {gas.savings > 0 && (
                  <div className="bg-surface rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs text-text-tertiary">Savings</p>
                      <p className="font-mono text-lg font-semibold text-solution-accent">{gas.savings}%</p>
                    </div>
                    <div className="w-full h-2 bg-problem-cell rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${(gas.mip8Gas / gas.currentGas) * 100}%` }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full bg-solution-accent rounded-full"
                      />
                    </div>
                    {gas.ratio > 1.5 && (
                      <p className="font-mono text-xs text-solution-accent font-semibold mt-2">{gas.ratio.toFixed(1)}x cheaper</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
