"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useInView } from "../useInView";

const STEPS = [
  {
    id: "monad-claims",
    label: "Monad adds an opcode",
    monad: { byte: "0xAB", name: "FAST_HASH", status: "claimed" },
    ethereum: { byte: "0xAB", name: "(unassigned)", status: "free" },
    message: "Monad adds opcode 0xAB as FAST_HASH, a Monad-specific optimized hash. Works great on Monad.",
  },
  {
    id: "eth-claims",
    label: "Ethereum later assigns the same slot",
    monad: { byte: "0xAB", name: "FAST_HASH", status: "claimed" },
    ethereum: { byte: "0xAB", name: "NEW_PRECOMPILE", status: "claimed" },
    message: "Ethereum's next upgrade assigns 0xAB to a new system precompile. The same slot, a completely different function.",
  },
  {
    id: "divergence",
    label: "Same bytecode, different behavior",
    monad: { byte: "0xAB", name: "FAST_HASH", status: "conflict" },
    ethereum: { byte: "0xAB", name: "NEW_PRECOMPILE", status: "conflict" },
    message: "A contract deployed on Monad uses 0xAB. If that bytecode ever runs on Ethereum, 0xAB means something entirely different. No error, just silent wrong behavior.",
  },
];

export default function CollisionSection() {
  const { ref, isVisible } = useInView(0.1);
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-alt relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          The collision problem
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          Ethereum assigns new opcodes with every upgrade. Any slot Monad
          claims today might be claimed by Ethereum tomorrow, turning the
          same bytecode into two different programs on two different chains.
        </p>

        {/* Step buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStepIdx(i)}
              className={`font-mono text-xs px-3 py-2 rounded-md border transition-all cursor-pointer ${
                i === stepIdx
                  ? "bg-text-primary text-surface border-text-primary"
                  : "bg-surface-elevated border-border hover:border-text-secondary"
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        {/* Chain comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Monad */}
          <div
            className={`rounded-xl border p-6 transition-all duration-300 ${
              step.monad.status === "conflict"
                ? "bg-problem-bg border-problem-cell-hover"
                : "bg-surface-elevated border-border"
            }`}
          >
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">
              Monad
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`font-mono text-2xl font-semibold tabular-nums px-3 py-1.5 rounded-lg ${
                  step.monad.status === "claimed" || step.monad.status === "conflict"
                    ? "bg-solution-accent text-white"
                    : "bg-border text-text-tertiary"
                }`}
              >
                {step.monad.byte}
              </div>
              <div>
                <p
                  className={`font-mono text-sm font-semibold ${
                    step.monad.status === "claimed" || step.monad.status === "conflict"
                      ? "text-solution-accent"
                      : "text-text-tertiary"
                  }`}
                >
                  {step.monad.name}
                </p>
                <p className="font-mono text-xs text-text-tertiary mt-0.5">
                  {step.monad.status === "free"
                    ? "not yet assigned"
                    : step.monad.status === "claimed"
                    ? "assigned by Monad"
                    : "assigned by Monad"}
                </p>
              </div>
            </div>
            {(step.monad.status === "claimed" || step.monad.status === "conflict") && (
              <div className="font-mono text-xs bg-surface rounded-lg p-3 border border-border">
                <span className="text-text-tertiary">// executes </span>
                <span className="text-solution-accent">Monad FAST_HASH</span>
              </div>
            )}
          </div>

          {/* Ethereum */}
          <div
            className={`rounded-xl border p-6 transition-all duration-300 ${
              step.ethereum.status === "conflict"
                ? "bg-problem-bg border-problem-cell-hover"
                : "bg-surface-elevated border-border"
            }`}
          >
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">
              Ethereum
            </p>
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`font-mono text-2xl font-semibold tabular-nums px-3 py-1.5 rounded-lg ${
                  step.ethereum.status === "claimed"
                    ? "bg-problem-accent text-white"
                    : step.ethereum.status === "conflict"
                    ? "bg-problem-accent text-white"
                    : "bg-border text-text-tertiary"
                }`}
              >
                {step.ethereum.byte}
              </div>
              <div>
                <p
                  className={`font-mono text-sm font-semibold ${
                    step.ethereum.status === "claimed" || step.ethereum.status === "conflict"
                      ? "text-problem-accent"
                      : "text-text-tertiary"
                  }`}
                >
                  {step.ethereum.name}
                </p>
                <p className="font-mono text-xs text-text-tertiary mt-0.5">
                  {step.ethereum.status === "free"
                    ? "not yet assigned"
                    : "assigned by Ethereum upgrade"}
                </p>
              </div>
            </div>
            {step.ethereum.status === "claimed" || step.ethereum.status === "conflict" ? (
              <div className="font-mono text-xs bg-surface rounded-lg p-3 border border-border">
                <span className="text-text-tertiary">// executes </span>
                <span className="text-problem-accent">Ethereum NEW_PRECOMPILE</span>
              </div>
            ) : (
              <div className="font-mono text-xs bg-surface rounded-lg p-3 border border-border text-text-tertiary">
                // 0xAB → INVALID
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border p-4 ${
              step.monad.status === "conflict"
                ? "bg-problem-bg border-problem-cell-hover"
                : "bg-surface-elevated border-border"
            }`}
          >
            <p
              className={`font-mono text-sm ${
                step.monad.status === "conflict"
                  ? "text-problem-accent"
                  : "text-text-secondary"
              }`}
            >
              {step.message}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* The fix callout */}
        {stepIdx === STEPS.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 rounded-xl bg-solution-bg border border-solution-accent-light p-5"
          >
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-2">
              MIP-7 solution
            </p>
            <p className="font-mono text-sm text-solution-accent">
              Instead of claiming{" "}
              <span className="font-semibold">0xAB</span>, Monad uses{" "}
              <span className="font-semibold">0xAE 0x01</span>. The{" "}
              <span className="font-semibold">0xAE</span> slot is reserved on
              Ethereum L1 as INVALID forever. No collision is possible.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
