"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";

const COLS = 8;
const ROWS = 6;
const TOTAL = COLS * ROWS;

type CellState = "encrypted" | "selected" | "revealed" | "skipped";

function generateSelection(): Set<number> {
  // ~35-45% of ciphertexts land in the block
  const target = Math.floor(TOTAL * (0.35 + Math.random() * 0.1));
  const set = new Set<number>();
  while (set.size < target) {
    set.add(Math.floor(Math.random() * TOTAL));
  }
  return set;
}

const INITIAL_SELECTION = new Set<number>([
  2, 5, 9, 11, 14, 17, 20, 23, 26, 29, 32, 35, 39, 42, 45,
]);

export default function BteHeroSection() {
  const [cycle, setCycle] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(INITIAL_SELECTION);
  const [phase, setPhase] = useState<"encrypt" | "select" | "decrypt" | "done">(
    "encrypt"
  );

  useEffect(() => {
    let cancelled = false;
    const t: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (cancelled) return;
      setSelected(generateSelection());
      setPhase("encrypt");
      t.push(setTimeout(() => !cancelled && setPhase("select"), 1400));
      t.push(setTimeout(() => !cancelled && setPhase("decrypt"), 2600));
      t.push(setTimeout(() => !cancelled && setPhase("done"), 3800));
      t.push(
        setTimeout(() => {
          if (!cancelled) {
            setCycle((c) => c + 1);
            run();
          }
        }, 5800)
      );
    };
    run();

    return () => {
      cancelled = true;
      t.forEach(clearTimeout);
    };
  }, []);

  const cellState = (i: number): CellState => {
    const isSelected = selected.has(i);
    if (phase === "encrypt") return "encrypted";
    if (phase === "select") return isSelected ? "selected" : "encrypted";
    if (phase === "decrypt")
      return isSelected ? "revealed" : "skipped";
    return isSelected ? "revealed" : "skipped";
  };

  const revealedCount = phase === "decrypt" || phase === "done" ? selected.size : 0;
  const keptPrivateCount =
    phase === "decrypt" || phase === "done" ? TOTAL - selected.size : 0;

  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center py-20"
      >
        {/* Left: text */}
        <div>
          <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase mb-4">
            Category Labs research
          </p>
          <h1 className="text-5xl sm:text-6xl leading-[1.05] tracking-tight mb-8">
            <span className="block font-light mb-2">BTX</span>
            <span className="block font-semibold text-solution-accent">
              Batched Threshold Encryption
            </span>
          </h1>
          <p className="text-lg text-text-secondary font-light leading-relaxed mb-6 max-w-md">
            A critique echoing from traditional finance: public blockchains
            can&apos;t resist MEV, so they&apos;re not fit for markets. Encrypted
            mempools are the answer. BTX is what finally makes them
            practical.
          </p>
          <p className="text-base text-solution-accent/90 font-light italic leading-relaxed max-w-md mb-8">
            Shortest ciphertext. Collision-free. Epochless.
            <br />
            Fast enough for real block times.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://category-labs.github.io/category-research/BTX-paper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-text-primary text-surface px-5 py-3 rounded-lg font-mono text-xs hover:bg-text-secondary transition-colors min-h-11"
            >
              Read the paper (PDF)
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
            <a
              href="#the-problem"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors min-h-11 px-2"
            >
              Or read the explainer
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        {/* Right: encrypted pool visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[11px] text-text-tertiary tracking-wider uppercase">
              Encrypted mempool
            </p>
            <PhaseLabel phase={phase} />
          </div>

          <div className="bg-surface-elevated rounded-xl p-5 border border-border shadow-sm">
            <div
              className="grid gap-[4px]"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: TOTAL }, (_, i) => {
                const state = cellState(i);
                return (
                  <motion.div
                    key={`${cycle}-${i}`}
                    className="aspect-square rounded-[4px] flex items-center justify-center relative overflow-hidden"
                    animate={{
                      backgroundColor:
                        state === "encrypted"
                          ? colors.border
                          : state === "selected"
                            ? colors.problemAccentLight
                            : state === "revealed"
                              ? colors.solutionAccentLight
                              : "#e8e2da", // one-off faded "skipped" tint; no reusable token
                      scale: state === "selected" ? 1.05 : 1,
                    }}
                    transition={{
                      duration: 0.35,
                      delay: state === "revealed" ? (i * 0.012) % 0.4 : 0,
                    }}
                  >
                    {state === "encrypted" && <LockIcon />}
                    {state === "selected" && <LockIcon highlight />}
                    {state === "revealed" && <CheckIcon />}
                    {state === "skipped" && <LockIcon muted />}
                  </motion.div>
                );
              })}
            </div>

            {/* Committee + stats row */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5">
                <Committee active={phase !== "encrypt"} />
                <span className="font-mono text-[10px] text-text-tertiary ml-2">
                  committee of N
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px]">
                <motion.span
                  animate={{ opacity: revealedCount > 0 ? 1 : 0.3 }}
                  className="text-solution-accent"
                >
                  {revealedCount} revealed
                </motion.span>
                <motion.span
                  animate={{ opacity: keptPrivateCount > 0 ? 1 : 0.3 }}
                  className="text-text-tertiary"
                >
                  {keptPrivateCount} stay private
                </motion.span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {[
              [colors.border, "Encrypted"],
              [colors.problemAccentLight, "Selected for block"],
              [colors.solutionAccentLight, "Decrypted by committee"],
            ].map(([bg, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: bg }}
                />
                <span className="font-mono text-[10px] text-text-tertiary">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function PhaseLabel({ phase }: { phase: "encrypt" | "select" | "decrypt" | "done" }) {
  const labels = {
    encrypt: { text: "users submit", color: colors.textTertiary },
    select: { text: "block builder picks batch", color: colors.problemAccent },
    decrypt: { text: "committee opens batch", color: colors.solutionAccent },
    done: { text: "block executes", color: colors.solutionAccent },
  } as const;
  const label = labels[phase];
  return (
    <motion.span
      key={phase}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded"
      style={{ color: label.color, backgroundColor: label.color + "15" }}
    >
      {label.text}
    </motion.span>
  );
}

function Committee({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          animate={{
            backgroundColor: active ? colors.solutionAccent : colors.textTertiary,
            scale: active ? [1, 1.3, 1] : 1,
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.08,
            repeat: active ? Infinity : 0,
            repeatDelay: 1.2,
          }}
        />
      ))}
    </div>
  );
}

function LockIcon({
  highlight,
  muted,
}: {
  highlight?: boolean;
  muted?: boolean;
}) {
  const color = highlight ? colors.problemAccent : muted ? colors.textTertiary : colors.textSecondary;
  return (
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5 opacity-60" fill="none" aria-hidden="true">
      <rect
        x={4}
        y={7}
        width={8}
        height={6}
        rx={1}
        stroke={color}
        strokeWidth={1.2}
      />
      <path
        d="M5.5 7V5.5a2.5 2.5 0 1 1 5 0V7"
        stroke={color}
        strokeWidth={1.2}
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 5"
        stroke={colors.solutionAccent}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
