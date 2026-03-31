"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { useInView } from "../useInView";

const TOTAL_MB = 8;

interface CallFrame {
  name: string;
  allocMB: number;
  color: string;
}

const DEMO_STEPS: { action: string; frames: CallFrame[] }[] = [
  {
    action: "Transaction starts with 8 MB pool",
    frames: [],
  },
  {
    action: "Contract A allocates 1 MB",
    frames: [{ name: "Contract A", allocMB: 1, color: "bg-problem-accent" }],
  },
  {
    action: "A calls B. B allocates 3 MB",
    frames: [
      { name: "Contract A", allocMB: 1, color: "bg-problem-accent" },
      { name: "Contract B", allocMB: 3, color: "bg-solution-accent" },
    ],
  },
  {
    action: "B calls C. C allocates 2 MB",
    frames: [
      { name: "Contract A", allocMB: 1, color: "bg-problem-accent" },
      { name: "Contract B", allocMB: 3, color: "bg-solution-accent" },
      { name: "Contract C", allocMB: 2, color: "bg-text-secondary" },
    ],
  },
  {
    action: "C returns. Its 2 MB is released back to the pool",
    frames: [
      { name: "Contract A", allocMB: 1, color: "bg-problem-accent" },
      { name: "Contract B", allocMB: 3, color: "bg-solution-accent" },
    ],
  },
  {
    action: "B returns. Its 3 MB is released back to the pool",
    frames: [{ name: "Contract A", allocMB: 1, color: "bg-problem-accent" }],
  },
  {
    action: "A calls D. D allocates 4 MB (7 MB available)",
    frames: [
      { name: "Contract A", allocMB: 1, color: "bg-problem-accent" },
      { name: "Contract D", allocMB: 4, color: "bg-solution-muted" },
    ],
  },
];

export default function MemoryPoolSection() {
  const { ref, isVisible } = useInView(0.1);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const step = DEMO_STEPS[stepIdx];
  const usedMB = step.frames.reduce((sum, f) => sum + f.allocMB, 0);
  const freeMB = TOTAL_MB - usedMB;
  const finished = stepIdx >= DEMO_STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (stepIdx < DEMO_STEPS.length - 1) {
      setStepIdx((s) => s + 1);
    }
  }, [stepIdx]);

  const handlePrev = useCallback(() => {
    if (stepIdx > 0) {
      setStepIdx((s) => s - 1);
    }
  }, [stepIdx]);

  const handlePlay = useCallback(() => {
    setStepIdx(0);
    setIsPlaying(true);
  }, []);

  // Auto-advance when playing using a timer
  useEffect(() => {
    if (!isPlaying) return;
    if (stepIdx >= DEMO_STEPS.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIdx((s) => s + 1), 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, stepIdx]);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-elevated relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Shared memory pool
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-2">
          Under MIP-3, child calls share the same 8 MB memory pool with their
          parent. When a call returns, its memory is released back.
        </p>
        <p className="text-sm text-text-tertiary font-light max-w-3xl leading-relaxed mb-10">
          On the current EVM, each call context gets fresh isolated memory.
          MIP-3 pools it, so nested calls don&apos;t waste the budget.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pool bar visualization */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider">
                8 MB Transaction Pool
              </p>
              <p className="font-mono text-xs text-text-tertiary">
                {freeMB} MB free
              </p>
            </div>

            {/* The pool bar */}
            <div className="w-full h-16 bg-border/30 rounded-lg overflow-hidden flex">
              <AnimatePresence mode="popLayout">
                {step.frames.map((frame) => (
                  <motion.div
                    key={frame.name}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{
                      width: `${(frame.allocMB / TOTAL_MB) * 100}%`,
                      opacity: 1,
                    }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className={`${frame.color} h-full flex items-center justify-center`}
                  >
                    <p className="font-mono text-xs text-white font-semibold truncate px-2">
                      {frame.name} ({frame.allocMB} MB)
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Scale */}
            <div className="flex justify-between mt-2 font-mono text-xs text-text-tertiary">
              <span>0 MB</span>
              <span>4 MB</span>
              <span>8 MB</span>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <p className="font-mono text-2xl font-semibold text-problem-accent tabular-nums">
                  {usedMB}
                </p>
                <p className="font-mono text-xs text-text-tertiary">MB used</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-semibold text-solution-accent tabular-nums">
                  {freeMB}
                </p>
                <p className="font-mono text-xs text-text-tertiary">MB free</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-2xl font-semibold text-text-primary tabular-nums">
                  {step.frames.length}
                </p>
                <p className="font-mono text-xs text-text-tertiary">
                  call{step.frames.length !== 1 ? "s" : ""} deep
                </p>
              </div>
            </div>
          </div>

          {/* Call stack + action log */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">
              Call stack
            </p>
            <div className="space-y-2 mb-6 min-h-[120px]">
              <AnimatePresence>
                {step.frames.map((frame, i) => (
                  <motion.div
                    key={frame.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3"
                    style={{ paddingLeft: `${i * 16}px` }}
                  >
                    <div className={`w-3 h-3 rounded-sm ${frame.color}`} />
                    <p className="font-mono text-sm text-text-primary">
                      {frame.name}
                    </p>
                    <p className="font-mono text-xs text-text-tertiary">
                      {frame.allocMB} MB
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {step.frames.length === 0 && (
                <p className="font-mono text-xs text-text-tertiary italic">
                  No active calls
                </p>
              )}
            </div>

            {/* Action */}
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3 bg-surface-elevated rounded-lg border border-border"
              >
                <p className="font-mono text-xs text-solution-accent">
                  {step.action}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={stepIdx <= 0 || isPlaying}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
              stepIdx <= 0 || isPlaying
                ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                : "bg-surface-elevated border-border hover:border-text-secondary cursor-pointer"
            }`}
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={finished || isPlaying}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
              finished || isPlaying
                ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                : "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
            }`}
          >
            {stepIdx === 0 ? "Start" : "Next"}
          </button>
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all ${
              isPlaying
                ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                : "bg-surface-elevated border-border hover:border-text-secondary cursor-pointer"
            }`}
          >
            {isPlaying ? "Playing..." : "Auto-play"}
          </button>
          <p className="ml-auto font-mono text-xs text-text-tertiary tabular-nums">
            Step {stepIdx + 1} / {DEMO_STEPS.length}
          </p>
        </div>
      </div>
    </section>
  );
}
