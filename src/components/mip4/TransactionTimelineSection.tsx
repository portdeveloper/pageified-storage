"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { useInView } from "../useInView";

const RESERVE = 10;

interface Account {
  name: string;
  balance: number;
}

interface TimelineStep {
  action: string;
  detail: string;
  changes: { account: number; delta: number }[];
}

const INITIAL_ACCOUNTS: Account[] = [
  { name: "Alice", balance: 25 },
  { name: "Bob", balance: 15 },
  { name: "Pool", balance: 50 },
];

const STEPS: TimelineStep[] = [
  {
    action: "Alice swaps 8 MON into Pool",
    detail: "Alice sends MON to the liquidity pool",
    changes: [
      { account: 0, delta: -8 },
      { account: 2, delta: 8 },
    ],
  },
  {
    action: "Pool sends 5 MON to Bob",
    detail: "Pool distributes rewards to Bob",
    changes: [
      { account: 2, delta: -5 },
      { account: 1, delta: 5 },
    ],
  },
  {
    action: "Alice sends 10 MON to Bob",
    detail: "Alice drops below 10 MON reserve!",
    changes: [
      { account: 0, delta: -10 },
      { account: 1, delta: 10 },
    ],
  },
  {
    action: "Bob sends 12 MON to Pool",
    detail: "Bob is still above reserve",
    changes: [
      { account: 1, delta: -12 },
      { account: 2, delta: 12 },
    ],
  },
  {
    action: "Pool refunds 5 MON to Alice",
    detail: "Alice is back above reserve!",
    changes: [
      { account: 2, delta: -5 },
      { account: 0, delta: 5 },
    ],
  },
];

function computeBalances(stepIdx: number): number[] {
  const balances = INITIAL_ACCOUNTS.map((a) => a.balance);
  for (let i = 0; i <= stepIdx && i < STEPS.length; i++) {
    for (const change of STEPS[i].changes) {
      balances[change.account] += change.delta;
    }
  }
  return balances;
}

function isViolating(balance: number, isContract: boolean): boolean {
  if (isContract) return false; // Contracts exempt
  return balance < RESERVE;
}

export default function TransactionTimelineSection() {
  const { ref, isVisible } = useInView(0.1);
  const [stepIdx, setStepIdx] = useState(-1);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);

  const balances =
    stepIdx >= 0 ? computeBalances(stepIdx) : INITIAL_ACCOUNTS.map((a) => a.balance);

  // Pool (index 2) is a contract, exempt from reserve
  const violations = balances.map((b, i) => isViolating(b, i === 2));
  const anyViolation = violations.some((v) => v);

  const handleNext = useCallback(() => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((s) => s + 1);
      setCheckResult(null);
    }
  }, [stepIdx]);

  const handlePrev = useCallback(() => {
    if (stepIdx > 0) {
      setStepIdx((s) => s - 1);
      setCheckResult(null);
    }
  }, [stepIdx]);

  const handleReset = useCallback(() => {
    setStepIdx(-1);
    setCheckResult(null);
  }, []);

  const handleCheck = useCallback(() => {
    setCheckResult(anyViolation);
  }, [anyViolation]);

  // Keyboard navigation — only when focus is within this section
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const focused = e.target as Element;
      if (focused.closest('button, a, select, [role="button"]')) return;
      if (!sectionRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "r" || e.key === "R") {
        handleReset();
      } else if (e.key === "c" || e.key === "C") {
        handleCheck();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNext, handlePrev, handleReset, handleCheck]);

  const maxBalance = 70; // for bar scaling
  const finished = stepIdx >= STEPS.length - 1;

  return (
    <section ref={(el) => { (ref as React.MutableRefObject<HTMLElement | null>).current = el; sectionRef.current = el; }} className="py-24 px-6 bg-surface-elevated relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Watch the reserve in action
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          Step through a transaction that moves MON between accounts. The 10 MON
          reserve line shows when an account is in violation. Call{" "}
          <code className="font-mono text-sm bg-surface px-1.5 py-0.5 rounded border border-border">
            dippedIntoReserve()
          </code>{" "}
          at any point to check.
        </p>

        {/* Account balance bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {INITIAL_ACCOUNTS.map((account, i) => {
            const balance = balances[i];
            const violated = violations[i];
            const isContract = i === 2;
            const barWidth = Math.max(2, (balance / maxBalance) * 100);
            const reservePos = (RESERVE / maxBalance) * 100;

            return (
              <div
                key={account.name}
                className={`rounded-xl p-4 border transition-all duration-300 ${
                  violated
                    ? "bg-problem-bg border-problem-accent"
                    : "bg-surface border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs font-semibold">
                    {account.name}
                  </p>
                  {isContract && (
                    <span className="font-mono text-xs text-text-tertiary">
                      contract
                    </span>
                  )}
                  {violated && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-mono text-xs px-1.5 py-0.5 rounded-full bg-problem-accent text-white"
                    >
                      VIOLATION
                    </motion.span>
                  )}
                </div>

                {/* Balance bar */}
                <div className="relative w-full h-8 bg-border/20 rounded-md overflow-visible mb-2">
                  {/* Reserve line (only for EOAs) */}
                  {!isContract && (
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-dashed border-problem-accent/50 z-10"
                      style={{ left: `${reservePos}%` }}
                    />
                  )}
                  <motion.div
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-md ${
                      violated ? "bg-problem-accent" : "bg-solution-accent"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <motion.p
                    key={balance}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    className={`font-mono text-lg font-semibold tabular-nums ${
                      violated ? "text-problem-accent" : "text-text-primary"
                    }`}
                  >
                    {balance} MON
                  </motion.p>
                  {!isContract && (
                    <p className="font-mono text-xs text-text-tertiary">
                      reserve: {RESERVE}
                    </p>
                  )}
                  {isContract && (
                    <p className="font-mono text-xs text-text-tertiary">
                      exempt
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current action */}
        <AnimatePresence mode="wait">
          {stepIdx >= 0 && stepIdx < STEPS.length && (
            <motion.div
              key={stepIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-lg border border-border bg-surface mb-6"
            >
              <p className="font-mono text-sm text-text-primary">
                {STEPS[stepIdx].action}
              </p>
              <p className="font-mono text-xs text-text-tertiary mt-1">
                {STEPS[stepIdx].detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* dippedIntoReserve result */}
        <AnimatePresence>
          {checkResult !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-lg border mb-6 ${
                checkResult
                  ? "bg-problem-bg border-problem-accent"
                  : "bg-solution-bg border-solution-accent-light"
              }`}
            >
              <p className="font-mono text-sm">
                <span className="text-text-tertiary">
                  IReserveBalance(0x1001).dippedIntoReserve() →{" "}
                </span>
                <span
                  className={`font-semibold ${
                    checkResult ? "text-problem-accent" : "text-solution-accent"
                  }`}
                >
                  {checkResult ? "true" : "false"}
                </span>
              </p>
              <p className="font-mono text-xs text-text-tertiary mt-1">
                {checkResult
                  ? "At least one touched account is below the 10 MON reserve"
                  : "All touched accounts are above the 10 MON reserve"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={stepIdx <= 0}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
              stepIdx <= 0
                ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                : "bg-surface-elevated border-border hover:border-text-secondary cursor-pointer"
            }`}
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={finished}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
              finished
                ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                : "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
            }`}
          >
            {stepIdx < 0 ? "Start" : "Next"}
          </button>
          <button
            onClick={handleCheck}
            disabled={stepIdx < 0}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
              stepIdx < 0
                ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                : "bg-text-primary text-surface border-text-primary hover:bg-text-primary/90 cursor-pointer"
            }`}
          >
            dippedIntoReserve()
          </button>
          {stepIdx >= 0 && (
            <button
              onClick={handleReset}
              className="font-mono text-xs px-3 py-2.5 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
          <p className="hidden sm:block font-mono text-xs text-text-tertiary/50">
            ← → keys
          </p>
          <p className="ml-auto font-mono text-xs text-text-tertiary tabular-nums">
            Step {Math.max(0, stepIdx + 1)} / {STEPS.length}
          </p>
        </div>
      </div>
    </section>
  );
}
