"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useCallback } from "react";
import {
  compileSolidity,
  groupByPage,
  calculateGas,
  type StorageVar,
  type CompilationResult,
} from "./solc-utils";

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract LendingPool {
    // Admin slots (page 0)
    address public owner;           // slot 0
    address public guardian;        // slot 1
    bool public paused;             // slot 2
    uint256 public totalDeposits;   // slot 3
    uint256 public totalBorrows;    // slot 4
    uint256 public reserveFactor;   // slot 5
    uint256 public liquidationBonus;// slot 6
    uint256 public borrowIndex;     // slot 7
    uint256 public supplyIndex;     // slot 8
    uint256 public lastUpdateBlock; // slot 9
    uint256 public interestRate;    // slot 10
    uint256 public utilizationRate; // slot 11
    address public oracle;          // slot 12
    address public interestModel;   // slot 13
    uint256 public maxLTV;          // slot 14
    uint256 public minDebt;         // slot 15

    // User data (mappings - scattered)
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;
    mapping(address => uint256) public collateral;

    function accrueInterest() external {
        // Reads: borrowIndex, supplyIndex, lastUpdateBlock,
        //        interestRate, totalBorrows, totalDeposits,
        //        reserveFactor, utilizationRate, interestModel
        // All in page 0 - massive MIP-8 benefit
    }
}`;

type Tab = "paste" | "github";

export default function AnalyzerPage() {
  const [tab, setTab] = useState<Tab>("paste");
  const [source, setSource] = useState(SAMPLE_CONTRACT);
  const [githubUrl, setGithubUrl] = useState("");
  const [compiling, setCompiling] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleCompile = useCallback(async () => {
    setCompiling(true);
    setResult(null);
    setSelectedSlots(new Set());
    setFetchError(null);
    try {
      const res = await compileSolidity(source);
      setResult(res);
      // Auto-select all by default
      if (res.storageLayout) {
        setSelectedSlots(new Set(res.storageLayout.map((v) => v.slot)));
      }
    } catch (e) {
      setResult({
        success: false,
        errors: [e instanceof Error ? e.message : String(e)],
      });
    }
    setCompiling(false);
  }, [source]);

  const handleFetchGithub = useCallback(async () => {
    setFetchError(null);
    // Parse GitHub URL to raw content
    // Supports: github.com/owner/repo/blob/branch/path/to/File.sol
    const match = githubUrl.match(
      /github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+\.sol)/
    );
    if (!match) {
      setFetchError(
        "URL should be a direct .sol file: github.com/owner/repo/blob/branch/path/File.sol"
      );
      return;
    }
    const [, owner, repo, branch, path] = match;
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    try {
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const text = await res.text();
      setSource(text);
      setTab("paste");
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : String(e));
    }
  }, [githubUrl]);

  const toggleSlot = useCallback((slot: number) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot);
      else next.add(slot);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (result?.storageLayout) {
      setSelectedSlots(new Set(result.storageLayout.map((v) => v.slot)));
    }
  }, [result]);

  const selectNone = useCallback(() => {
    setSelectedSlots(new Set());
  }, []);

  const selectedVars = useMemo(
    () =>
      result?.storageLayout?.filter((v) => selectedSlots.has(v.slot)) || [],
    [result, selectedSlots]
  );

  const gas = useMemo(() => calculateGas(selectedVars), [selectedVars]);

  const pages = useMemo(
    () => (result?.storageLayout ? groupByPage(result.storageLayout) : new Map()),
    [result]
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
        Storage Layout Analyzer
      </h1>
      <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-2">
        Paste Solidity source or fetch from GitHub. See how storage variables
        group into 128-slot pages and calculate MIP-8 gas savings.
      </p>
      <p className="text-sm text-text-tertiary font-light max-w-3xl leading-relaxed mb-8">
        Select which variables a function accesses to see the improvement.
        Single-file contracts only. Use{" "}
        <code className="font-mono text-xs bg-surface-elevated px-1 py-0.5 rounded border border-border">
          forge flatten
        </code>{" "}
        for multi-file projects.
      </p>

      {/* Input tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("paste")}
          className={`font-mono text-xs px-3 py-2 rounded-md border transition-all cursor-pointer ${
            tab === "paste"
              ? "bg-text-primary text-surface border-text-primary"
              : "bg-surface-elevated border-border hover:border-text-secondary"
          }`}
        >
          Paste Solidity
        </button>
        <button
          onClick={() => setTab("github")}
          className={`font-mono text-xs px-3 py-2 rounded-md border transition-all cursor-pointer ${
            tab === "github"
              ? "bg-text-primary text-surface border-text-primary"
              : "bg-surface-elevated border-border hover:border-text-secondary"
          }`}
        >
          GitHub URL
        </button>
      </div>

      {/* Input area */}
      {tab === "paste" ? (
        <div className="mb-6">
          <textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full h-64 font-mono text-xs bg-surface-elevated border border-border rounded-xl p-4 resize-y focus:outline-none focus:border-text-secondary"
            placeholder="Paste your Solidity source code here..."
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/blob/main/src/Contract.sol"
              className="flex-1 font-mono text-xs bg-surface-elevated border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-text-secondary"
            />
            <button
              onClick={handleFetchGithub}
              className="font-mono text-xs px-4 py-3 rounded-lg bg-text-primary text-surface border border-text-primary hover:bg-text-primary/90 cursor-pointer transition-all"
            >
              Fetch
            </button>
          </div>
          {fetchError && (
            <p className="font-mono text-xs text-problem-accent">{fetchError}</p>
          )}
        </div>
      )}

      {/* Compile button */}
      <button
        onClick={handleCompile}
        disabled={compiling || !source.trim()}
        className={`font-mono text-xs px-6 py-3 rounded-lg border transition-all mb-8 ${
          compiling || !source.trim()
            ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
            : "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
        }`}
      >
        {compiling ? "Compiling..." : "Compile & Analyze"}
      </button>

      {/* Errors */}
      <AnimatePresence>
        {result && !result.success && result.errors && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-problem-bg border border-problem-cell-hover mb-6"
          >
            <p className="font-mono text-xs text-problem-accent font-semibold mb-2">
              Compilation errors
            </p>
            {result.errors.map((err, i) => (
              <pre
                key={i}
                className="font-mono text-xs text-problem-accent whitespace-pre-wrap mb-1"
              >
                {err}
              </pre>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {result?.success && result.storageLayout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Contract name */}
          <div className="flex items-center gap-3 mb-6">
            <p className="font-mono text-sm text-text-primary font-semibold">
              {result.contractName}
            </p>
            <p className="font-mono text-xs text-text-tertiary">
              {result.storageLayout.length} storage variable
              {result.storageLayout.length !== 1 ? "s" : ""},{" "}
              {pages.size} page{pages.size !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Storage layout - 2 cols */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider">
                  Storage layout by page
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="font-mono text-xs text-solution-accent hover:underline cursor-pointer"
                  >
                    Select all
                  </button>
                  <button
                    onClick={selectNone}
                    className="font-mono text-xs text-text-tertiary hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from(pages.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([pageNum, vars]: [number, StorageVar[]]) => {
                    const pageBase = pageNum * 128;
                    const selectedInPage = vars.filter((v: StorageVar) =>
                      selectedSlots.has(v.slot)
                    );
                    return (
                      <div
                        key={pageNum}
                        className={`rounded-xl border p-4 transition-all ${
                          selectedInPage.length > 0
                            ? "bg-solution-bg border-solution-accent-light"
                            : "bg-surface-elevated border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-mono text-xs font-semibold">
                            Page {pageNum}
                            <span className="text-text-tertiary font-normal ml-2">
                              slots {pageBase}-{pageBase + 127}
                            </span>
                          </p>
                          {selectedInPage.length > 0 && (
                            <span className="font-mono text-xs text-solution-accent">
                              {selectedInPage.length} selected
                            </span>
                          )}
                        </div>

                        {/* Page grid mini visualization */}
                        <div
                          className="grid gap-[1px] mb-3"
                          style={{
                            gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
                          }}
                        >
                          {Array.from({ length: Math.min(32, 128) }, (_, i) => {
                            const absSlot = pageBase + i;
                            const hasVar = vars.some((v) => v.slot === absSlot);
                            const isSelected = selectedSlots.has(absSlot);

                            let bg = "bg-border/30";
                            if (isSelected) bg = "bg-solution-accent";
                            else if (hasVar) bg = "bg-solution-accent-light";

                            return (
                              <div
                                key={i}
                                className={`aspect-square rounded-[1px] ${bg}`}
                              />
                            );
                          })}
                        </div>

                        {/* Variable list */}
                        <div className="space-y-1">
                          {vars.map((v, vi) => (
                            <label
                              key={`${v.slot}-${v.label}`}
                              className="flex items-center gap-3 py-1 px-2 rounded hover:bg-surface cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedSlots.has(v.slot)}
                                onChange={() => toggleSlot(v.slot)}
                                className="accent-solution-accent"
                              />
                              <span className="font-mono text-xs text-text-tertiary w-12 tabular-nums">
                                slot {v.slot}
                              </span>
                              <span
                                className={`font-mono text-xs ${
                                  selectedSlots.has(v.slot)
                                    ? "text-solution-accent font-semibold"
                                    : "text-text-primary"
                                }`}
                              >
                                {v.label}
                              </span>
                              <span className="font-mono text-xs text-text-tertiary ml-auto">
                                {v.type}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {result.storageLayout.length === 0 && (
                <div className="bg-surface-elevated rounded-xl border border-border p-6 text-center">
                  <p className="font-mono text-xs text-text-tertiary">
                    No storage variables found. This contract may only use
                    mappings, constants, or immutables.
                  </p>
                </div>
              )}
            </div>

            {/* Gas results - 1 col */}
            <div className="space-y-4">
              <div className="sticky top-16">
                <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
                  Gas comparison
                </p>

                {/* Selected count */}
                <div className="bg-surface-elevated rounded-xl border border-border p-4 mb-4">
                  <p className="font-mono text-xs text-text-tertiary mb-1">
                    Selected variables
                  </p>
                  <p className="font-mono text-2xl font-semibold text-text-primary tabular-nums">
                    {selectedVars.length}
                  </p>
                  <p className="font-mono text-xs text-text-tertiary">
                    across{" "}
                    {new Set(selectedVars.map((v) => v.page)).size} page
                    {new Set(selectedVars.map((v) => v.page)).size !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                {/* Monad current */}
                <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-4 mb-4">
                  <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-2">
                    Monad (current)
                  </p>
                  <motion.p
                    key={gas.currentGas}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="font-mono text-2xl font-semibold text-problem-accent tabular-nums"
                  >
                    {gas.currentGas.toLocaleString()}
                  </motion.p>
                  <p className="font-mono text-xs text-text-tertiary">
                    {selectedVars.length} x 8,100 gas
                  </p>
                </div>

                {/* MIP-8 */}
                <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-4 mb-4">
                  <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-2">
                    MIP-8
                  </p>
                  <motion.p
                    key={gas.mip8Gas}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="font-mono text-2xl font-semibold text-solution-accent tabular-nums"
                  >
                    {gas.mip8Gas.toLocaleString()}
                  </motion.p>
                  <p className="font-mono text-xs text-text-tertiary">
                    {new Set(selectedVars.map((v) => v.page)).size} x 8,100 +{" "}
                    {Math.max(
                      0,
                      selectedVars.length -
                        new Set(selectedVars.map((v) => v.page)).size
                    )}{" "}
                    x 100
                  </p>
                </div>

                {/* Savings */}
                {gas.savings > 0 && (
                  <motion.div
                    key={gas.savings}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="bg-surface-elevated rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs text-text-tertiary">
                        Savings
                      </p>
                      <p className="font-mono text-lg font-semibold text-solution-accent">
                        {gas.savings}%
                      </p>
                    </div>
                    <div className="w-full h-3 bg-problem-cell rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(gas.mip8Gas / gas.currentGas) * 100}%`,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-full bg-solution-accent rounded-full"
                      />
                    </div>
                    <div className="flex justify-between mt-1 font-mono text-xs text-text-tertiary">
                      <span>MIP-8</span>
                      <span>Current</span>
                    </div>
                    {gas.ratio > 1.5 && (
                      <p className="font-mono text-xs text-solution-accent font-semibold mt-2">
                        {gas.ratio.toFixed(1)}x cheaper
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
