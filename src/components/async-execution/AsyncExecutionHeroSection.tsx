"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const BLOCKS = ["N", "N+1", "N+2", "N+3"];
const MARKERS = [
  { label: "proposal", color: colors.problemAccentStrong },
  { label: "vote", color: colors.userAccent },
  { label: "finalize", color: colors.solutionAccent },
];

export default function AsyncExecutionHeroSection() {
  const reduced = usePrefersReducedMotion();
  const [slot, setSlot] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => {
      setSlot((current) => (current + 1) % BLOCKS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [reduced]);

  const active = reduced ? 2 : slot;
  const executionIndex = Math.max(0, active - 1);

  return (
    <section className="min-h-[88vh] flex items-center px-6 pt-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-12 lg:gap-16 items-center py-14"
      >
        <div>
          <p className="font-mono text-xs text-text-tertiary uppercase mb-5">
            Monad architecture
          </p>
          <h1 className="text-5xl sm:text-6xl font-light leading-[1.05] mb-6">
            Consensus first.
            <br />
            <span className="font-semibold text-solution-accent">
              Execution alongside.
            </span>
          </h1>
          <p className="text-lg text-text-secondary font-light leading-relaxed max-w-xl mb-5">
            Monad nodes agree on transaction ordering without executing the
            block first. Execution moves into a separate, slightly lagged lane,
            so it can use the full block time instead of fighting consensus for
            a small slice.
          </p>
          <p className="text-sm text-text-tertiary font-light leading-relaxed max-w-xl">
            Same ordered transactions, same deterministic result. The pipeline
            changes when the work is done.
          </p>
        </div>

        <PipelineViz active={active} executionIndex={executionIndex} />
      </motion.div>
    </section>
  );
}

function PipelineViz({
  active,
  executionIndex,
}: {
  active: number;
  executionIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-[11px] text-text-tertiary uppercase">
          live pipeline
        </p>
        <div className="flex items-center gap-2 font-mono text-[10px] text-text-tertiary">
          {MARKERS.map((marker) => (
            <span key={marker.label} className="inline-flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: marker.color }}
              />
              {marker.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <Lane
          title="Consensus lane"
          subtitle="orders blocks"
          blocks={BLOCKS}
          activeIndex={active}
          accent={colors.problemAccentStrong}
          stateLabels={["Proposed", "Voted", "Finalized", "Next"]}
          delay={0}
        />
        <Lane
          title="Execution lane"
          subtitle="catches up"
          blocks={["N-1", "N", "N+1", "N+2"]}
          activeIndex={executionIndex}
          accent={colors.solutionAccent}
          stateLabels={["Verified", "Executing", "Queued", "Queued"]}
          delay={0.35}
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {[
          ["0", "extra executions before proposal"],
          ["D=3", "delayed root check"],
          ["1.2s", "new funding delay"],
        ].map(([value, label]) => (
          <div key={value} className="bg-surface rounded-lg border border-border p-3">
            <p className="font-mono text-lg font-semibold text-text-primary tabular-nums">
              {value}
            </p>
            <p className="font-mono text-[9px] text-text-tertiary leading-snug">
              {label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href="#developer-effects"
        className="group mt-5 inline-flex items-center font-mono text-xs text-text-tertiary hover:text-text-primary transition-colors min-h-11"
      >
        What changes for apps
        <span className="ml-1 transition-transform group-hover:translate-x-1">-&gt;</span>
      </Link>
    </motion.div>
  );
}

function Lane({
  title,
  subtitle,
  blocks,
  activeIndex,
  accent,
  stateLabels,
  delay,
}: {
  title: string;
  subtitle: string;
  blocks: string[];
  activeIndex: number;
  accent: string;
  stateLabels: string[];
  delay: number;
}) {
  return (
    <div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="font-mono text-xs text-text-primary">{title}</p>
          <p className="font-mono text-[10px] text-text-tertiary">{subtitle}</p>
        </div>
        <p className="font-mono text-[10px] text-text-tertiary">
          one block every ~400ms
        </p>
      </div>
      <div className="relative grid grid-cols-4 gap-2">
        <motion.div
          aria-hidden
          className="absolute top-1/2 left-0 right-0 h-px bg-border"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay }}
        />
        <motion.div
          aria-hidden
          className="absolute top-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.85)]"
          animate={{
            left: `${Math.min(100, Math.max(0, (activeIndex / (blocks.length - 1)) * 100))}%`,
            backgroundColor: accent,
          }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        />
        {blocks.map((block, index) => {
          const isActive = index === activeIndex;
          const isDone = index < activeIndex;
          return (
            <motion.div
              key={block}
              animate={{
                backgroundColor: isActive
                  ? "rgba(255,255,255,1)"
                  : isDone
                    ? "rgba(240,247,245,1)"
                    : "rgba(248,246,243,1)",
                borderColor: isActive ? accent : colors.border,
              }}
              transition={{ duration: 0.35 }}
              className="relative min-h-[86px] rounded-xl border p-3 overflow-hidden"
            >
              <motion.div
                animate={{ scaleX: isActive ? 1 : isDone ? 1 : 0.12 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-0 h-1 origin-left"
                style={{ backgroundColor: accent, width: "100%" }}
              />
              <p
                className="font-mono text-base font-semibold tabular-nums"
                style={{ color: isActive ? accent : colors.textPrimary }}
              >
                {block}
              </p>
              <p className="font-mono text-[10px] text-text-tertiary mt-1">
                {stateLabels[index]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
