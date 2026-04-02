"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Mini-visualization: MIP-8 page-aligned grid ────────────────────── */
function MiniGrid() {
  const cols = 16;
  const rows = 4;
  const total = cols * rows;
  const [activeSlot, setActiveSlot] = useState(-1);
  const [pageHighlight, setPageHighlight] = useState(false);

  const cycleRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;

    const runCycle = () => {
      if (cancelled) return;
      // Pick a random slot in the second row (page 1)
      const slot = cols + Math.floor(Math.random() * cols);
      setActiveSlot(slot);
      setPageHighlight(false);

      cycleRef.current = setTimeout(() => {
        if (cancelled) return;
        setPageHighlight(true);

        cycleRef.current = setTimeout(() => {
          if (cancelled) return;
          setActiveSlot(-1);
          setPageHighlight(false);

          cycleRef.current = setTimeout(runCycle, 800);
        }, 2000);
      }, 600);
    };

    const initial = setTimeout(runCycle, 500);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearTimeout(cycleRef.current);
    };
  }, []);

  const pageRow = Math.floor(activeSlot / cols);

  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => {
        const row = Math.floor(i / cols);
        const isActive = i === activeSlot;
        const isPageLit = pageHighlight && row === pageRow;

        let bg = "#e2ddd7";
        if (isActive) bg = "#c4653a";
        else if (isPageLit) bg = "#2a7d6a";

        return (
          <motion.div
            key={i}
            animate={{ backgroundColor: bg }}
            transition={{ duration: 0.2, delay: isPageLit ? (i % cols) * 0.02 : 0 }}
            className="aspect-square rounded-[2px]"
          />
        );
      })}
    </div>
  );
}

/* ─── Mini-visualization: MIP-3 cost bars ────────────────────────────── */
function MiniCostBars() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let frame: ReturnType<typeof setTimeout>;

    const run = () => {
      let p = 0;
      const tick = () => {
        if (cancelled) return;
        p += 0.025;
        if (p > 1) {
          setProgress(1);
          frame = setTimeout(() => {
            setProgress(0);
            frame = setTimeout(run, 600);
          }, 2000);
          return;
        }
        setProgress(p);
        frame = setTimeout(tick, 50);
      };
      tick();
    };

    frame = setTimeout(run, 800);
    return () => {
      cancelled = true;
      clearTimeout(frame);
    };
  }, []);

  // Quadratic grows as p², linear grows as p
  const quadratic = Math.min(100, progress * progress * 100);
  const linear = Math.min(100, progress * 25); // caps at 25% for visual contrast

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-problem-muted w-10 shrink-0">
          EVM
        </span>
        <div className="flex-1 h-2 bg-problem-cell/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-problem-accent rounded-full"
            animate={{ width: `${Math.max(2, quadratic)}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-solution-muted w-10 shrink-0">
          MIP-3
        </span>
        <div className="flex-1 h-2 bg-solution-cell/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-solution-accent rounded-full"
            animate={{ width: `${Math.max(2, linear)}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Mini-visualization: MIP-4 balance bar ──────────────────────────── */
const BALANCE_STEPS = [
  { balance: 25, color: "#2a7d6a" },
  { balance: 18, color: "#2a7d6a" },
  { balance: 8, color: "#c4653a" },
  { balance: 8, color: "#c4653a" },
  { balance: 18, color: "#2a7d6a" },
  { balance: 18, color: "#2a7d6a" },
];

function MiniBalanceBar() {
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      const next = (stepRef.current + 1) % BALANCE_STEPS.length;
      stepRef.current = next;
      setStep(next);
      const delay = next === 0 ? 2500 : 1200;
      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const current = BALANCE_STEPS[step];
  const pct = (current.balance / 30) * 100;
  const reservePct = (10 / 30) * 100;

  return (
    <div className="flex items-end gap-3 h-16">
      <div className="flex-1 h-full bg-border/30 rounded relative overflow-hidden">
        {/* Reserve line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-problem-accent/60 z-10"
          style={{ bottom: `${reservePct}%` }}
        />
        {/* Fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-b"
          animate={{
            height: `${pct}%`,
            backgroundColor: current.color,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="w-14 shrink-0 pb-0.5">
        <motion.p
          key={step}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="font-mono text-lg font-semibold tabular-nums leading-none"
          style={{ color: current.color }}
        >
          {current.balance}
        </motion.p>
        <p className="font-mono text-[9px] text-text-tertiary mt-0.5">MON</p>
      </div>
    </div>
  );
}

/* ─── Card component ─────────────────────────────────────────────────── */

interface MipCardProps {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  description: string;
  beta?: boolean;
  visualization: React.ReactNode;
  index: number;
}

function MipCard({
  id,
  href,
  title,
  subtitle,
  description,
  beta,
  visualization,
  index,
}: MipCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: 0.4 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      <Link
        href={href}
        aria-label={`Explore ${id}: ${title}`}
        className="group flex flex-col bg-surface-elevated rounded-2xl border border-border hover:border-text-tertiary/40 transition-all duration-300 hover:shadow-md overflow-hidden h-full"
      >
        {/* Visualization area */}
        <div className="px-6 pt-6 pb-4">{visualization}</div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[11px] text-text-tertiary tracking-wider">
              {id}
            </span>
            {beta && (
              <span className="font-mono text-[10px] text-text-tertiary bg-surface px-1.5 py-0.5 rounded-full">
                beta
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold mb-1 transition-colors duration-300 group-hover:text-solution-accent">
            {title}
          </h2>
          <p className="font-mono text-[11px] text-text-tertiary mb-2">
            {subtitle}
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
          <span className="inline-flex items-center gap-1 mt-4 font-mono text-xs text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">
            Explore
            <svg
              className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────── */

export default function HomeContent() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl w-full text-center mt-28 sm:mt-36 mb-2"
      >
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light leading-[1.05] tracking-tight mb-5">
          MIP Land
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light max-w-lg mx-auto leading-relaxed">
          Interactive explainers for Monad Improvement Proposals.{" "}
          <br className="hidden sm:block" />
          Understand MIPs through visualizations, not just specs.
        </p>
      </motion.div>

      {/* Section label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-4xl mb-5 mt-10"
      >
        <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase">
          Proposals
        </p>
      </motion.div>

      {/* Bento grid: MIP-8 featured, MIP-3 + MIP-4 side-by-side */}
      <div className="w-full max-w-4xl mb-28">
        {/* Featured: MIP-8 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="mb-4"
        >
          <Link
            href="/mip-8"
            aria-label="Explore MIP-8: Page-ified Storage"
            className="group block bg-surface-elevated rounded-2xl border border-border hover:border-text-tertiary/40 transition-all duration-300 hover:shadow-md overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Visualization */}
              <div className="p-8 flex flex-col justify-center">
                <div className="w-full max-w-[340px]">
                  <MiniGrid />
                </div>
                <p className="font-mono text-[10px] text-text-tertiary mt-3">
                  Slot access triggers a full 4 KB page read
                </p>
              </div>
              {/* Content */}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[11px] text-text-tertiary tracking-wider">
                    MIP-8
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-2 group-hover:text-solution-accent transition-colors duration-300">
                  Page-ified Storage
                </h2>
                <p className="font-mono text-[11px] text-text-tertiary mb-3">
                  Aligning EVM storage with hardware reality
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  See how 4 KB page-aligned reads cut random I/O and reshape gas
                  costs. Explore the slot-to-page mapping, compare gas schedules,
                  and step through real contract scenarios.
                </p>
                <span className="inline-flex items-center gap-1 mt-5 font-mono text-xs text-text-tertiary group-hover:text-text-secondary transition-colors duration-300">
                  Explore
                  <svg
                    className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Two-up: MIP-3 + MIP-4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MipCard
            id="MIP-3"
            href="/mip-3"
            title="Linear Memory"
            subtitle="Replacing quadratic memory costs"
            description="A linear cost model with a shared 8 MB pool. Watch the cost curve flatten as allocations grow."
            beta
            visualization={<MiniCostBars />}
            index={0}
          />
          <MipCard
            id="MIP-4"
            href="/mip-4"
            title="Reserve Balance Introspection"
            subtitle="Detecting reserve violations mid-execution"
            description="Letting contracts detect when an account dips below the 10 MON reserve threshold."
            beta
            visualization={<MiniBalanceBar />}
            index={1}
          />
        </div>
      </div>
    </main>
  );
}
