"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "../useInView";

interface UserOp {
  id: number;
  label: string;
  causesViolation: boolean;
}

const USER_OPS: UserOp[] = [
  { id: 1, label: "Swap 2 MON → USDC", causesViolation: false },
  { id: 2, label: "NFT mint (0.5 MON)", causesViolation: false },
  { id: 3, label: "Bridge 15 MON out", causesViolation: true },
  { id: 4, label: "Stake 1 MON", causesViolation: false },
  { id: 5, label: "Swap 0.1 MON → WETH", causesViolation: false },
];

type OpStatus = "pending" | "executing" | "success" | "failed" | "reverted";

export default function BundlerComparisonSection() {
  const { ref, isVisible } = useInView(0.1);
  const [mode, setMode] = useState<"without" | "with">("without");
  const [step, setStep] = useState(-1);
  const [opStatuses, setOpStatuses] = useState<OpStatus[]>(
    USER_OPS.map(() => "pending")
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep(-1);
    setOpStatuses(USER_OPS.map(() => "pending"));
    setIsPlaying(false);
    setMessage(null);
  }, []);

  const handlePlay = useCallback(() => {
    reset();
    setTimeout(() => setIsPlaying(true), 100);
  }, [reset]);

  const handleModeSwitch = useCallback(
    (newMode: "without" | "with") => {
      setMode(newMode);
      reset();
    },
    [reset]
  );

  // Auto-advance
  useEffect(() => {
    if (!isPlaying) return;

    const nextStep = step + 1;

    if (mode === "without") {
      // Without MIP-4: process until violation, then all fail
      if (nextStep >= USER_OPS.length) {
        setIsPlaying(false);
        return;
      }
      const op = USER_OPS[nextStep];
      const timer = setTimeout(() => {
        setStep(nextStep);
        setOpStatuses((prev) => {
          const next = [...prev];
          next[nextStep] = "executing";
          return next;
        });

        // After a brief "executing" phase, resolve
        setTimeout(() => {
          if (op.causesViolation) {
            // Everything fails
            setOpStatuses(USER_OPS.map(() => "failed"));
            setMessage(
              "Reserve violation at UserOp #3. Entire transaction reverts. All 5 ops lost."
            );
            setIsPlaying(false);
          } else {
            setOpStatuses((prev) => {
              const next = [...prev];
              next[nextStep] = "success";
              return next;
            });
          }
        }, 600);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      // With MIP-4: process each, check reserve, revert only the bad one
      if (nextStep >= USER_OPS.length) {
        setMessage(
          "4 of 5 UserOps succeeded. Only the violating op was reverted."
        );
        setIsPlaying(false);
        return;
      }
      const op = USER_OPS[nextStep];
      const timer = setTimeout(() => {
        setStep(nextStep);
        setOpStatuses((prev) => {
          const next = [...prev];
          next[nextStep] = "executing";
          return next;
        });

        setTimeout(() => {
          if (op.causesViolation) {
            setOpStatuses((prev) => {
              const next = [...prev];
              next[nextStep] = "reverted";
              return next;
            });
            setMessage("dippedIntoReserve() → true. Reverting UserOp #3 only.");
          } else {
            setOpStatuses((prev) => {
              const next = [...prev];
              next[nextStep] = "success";
              return next;
            });
            if (nextStep > 0 && USER_OPS[nextStep - 1]?.causesViolation) {
              setMessage(null); // Clear the violation message
            }
          }
        }, 600);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, step, mode]);

  const finished =
    step >= USER_OPS.length - 1 ||
    (mode === "without" && opStatuses.some((s) => s === "failed"));

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          The bundler problem
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          An ERC-4337 bundler processes multiple UserOperations in one
          transaction. Without MIP-4, a single reserve violation kills the
          entire bundle.
        </p>

        {/* Mode switcher */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => handleModeSwitch("without")}
            className={`font-mono text-xs px-4 py-2 rounded-md border transition-all cursor-pointer ${
              mode === "without"
                ? "bg-problem-accent text-white border-problem-accent"
                : "bg-surface-elevated border-border hover:border-text-secondary"
            }`}
          >
            Without MIP-4
          </button>
          <button
            onClick={() => handleModeSwitch("with")}
            className={`font-mono text-xs px-4 py-2 rounded-md border transition-all cursor-pointer ${
              mode === "with"
                ? "bg-solution-accent text-white border-solution-accent"
                : "bg-surface-elevated border-border hover:border-text-secondary"
            }`}
          >
            With MIP-4
          </button>
        </div>

        {/* UserOps list */}
        <div className="bg-surface-elevated rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider">
              Bundler: 5 UserOperations
            </p>
            {mode === "with" && (
              <p className="font-mono text-xs text-solution-accent">
                dippedIntoReserve() checked after each op
              </p>
            )}
          </div>

          <div className="space-y-2">
            {USER_OPS.map((op, i) => {
              const status = opStatuses[i];
              return (
                <motion.div
                  key={op.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    status === "executing"
                      ? "border-text-primary bg-surface"
                      : status === "success"
                      ? "border-solution-accent-light bg-solution-bg"
                      : status === "failed"
                      ? "border-problem-cell-hover bg-problem-bg"
                      : status === "reverted"
                      ? "border-problem-cell-hover bg-problem-bg"
                      : "border-border bg-surface-elevated"
                  }`}
                >
                  {/* Status indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0 ${
                      status === "success"
                        ? "bg-solution-accent text-white"
                        : status === "failed"
                        ? "bg-problem-accent text-white"
                        : status === "reverted"
                        ? "bg-problem-accent/60 text-white"
                        : status === "executing"
                        ? "bg-text-primary text-surface animate-pulse"
                        : "bg-border text-text-tertiary"
                    }`}
                  >
                    {status === "success"
                      ? "\u2713"
                      : status === "failed" || status === "reverted"
                      ? "\u2717"
                      : op.id}
                  </div>

                  <p
                    className={`font-mono text-sm ${
                      status === "failed"
                        ? "text-problem-accent line-through"
                        : status === "reverted"
                        ? "text-problem-accent line-through"
                        : status === "success"
                        ? "text-solution-accent"
                        : "text-text-primary"
                    }`}
                  >
                    UserOp #{op.id}: {op.label}
                  </p>

                  {status === "reverted" && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto font-mono text-xs px-2 py-0.5 rounded-full bg-problem-accent/20 text-problem-accent"
                    >
                      reverted only
                    </motion.span>
                  )}
                  {status === "failed" && mode === "without" && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-auto font-mono text-xs px-2 py-0.5 rounded-full bg-problem-accent/20 text-problem-accent"
                    >
                      lost
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-4 rounded-lg border mb-6 ${
                mode === "without"
                  ? "bg-problem-bg border-problem-cell-hover"
                  : "bg-solution-bg border-solution-accent-light"
              }`}
            >
              <p
                className={`font-mono text-sm ${
                  mode === "without"
                    ? "text-problem-accent"
                    : "text-solution-accent"
                }`}
              >
                {message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play button */}
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className={`font-mono text-xs px-6 py-2.5 rounded-lg border transition-all ${
            isPlaying
              ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
              : mode === "with"
              ? "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
              : "bg-problem-accent text-white border-problem-accent hover:bg-problem-accent/90 cursor-pointer"
          }`}
        >
          {isPlaying
            ? "Processing..."
            : finished
            ? "Replay"
            : "Run bundler"}
        </button>
      </div>
    </section>
  );
}
