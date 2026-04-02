"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const MIPS = [
  {
    id: "MIP-8",
    href: "/mip-8",
    title: "Page-ified Storage",
    description:
      "Aligning EVM storage with hardware reality. See how 4 KB page-aligned reads cut random I/O and reshape gas costs.",
  },
  {
    id: "MIP-3",
    href: "/mip-3",
    title: "Linear Memory",
    description:
      "Replacing quadratic memory costs with a linear model and a shared 8 MB pool. Watch the cost curve flatten.",
    beta: true,
  },
  {
    id: "MIP-4",
    href: "/mip-4",
    title: "Reserve Balance Introspection",
    description:
      "Letting contracts detect when an account dips below the 10 MON reserve threshold mid-execution.",
    beta: true,
  },
];

// Mini animated grid that hints at MIP-8's page concept
function MiniGrid() {
  const cols = 12;
  const rows = 3;
  const total = cols * rows;
  const [lit, setLit] = useState<Set<number>>(new Set());

  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const pageStart = 12;
    const pageSize = 12;

    const runCycle = () => {
      let i = 0;
      intervalRef.current = setInterval(() => {
        if (i < pageSize) {
          setLit((prev) => new Set([...prev, pageStart + i]));
          i++;
        } else {
          clearInterval(intervalRef.current);
          timeoutRef.current = setTimeout(() => {
            setLit(new Set());
            runCycle();
          }, 2000);
        }
      }, 80);
    };

    runCycle();

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            backgroundColor: lit.has(i) ? "#2a7d6a" : "#e2ddd7",
          }}
          transition={{ duration: 0.2 }}
          className="aspect-square rounded-[2px]"
        />
      ))}
    </div>
  );
}

export default function HomeContent() {
  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full text-center mt-24 mb-16"
      >
        <h1 className="text-4xl sm:text-5xl font-light leading-[1.1] tracking-tight mb-4">
          MIP Land
        </h1>
        <p className="text-lg text-text-secondary font-light max-w-md mx-auto leading-relaxed">
          Interactive explainers for Monad Improvement Proposals. Understand
          MIPs through visualizations, not just specs.
        </p>
      </motion.div>

      <div className="max-w-2xl w-full grid gap-4 mb-24">
        {MIPS.map((mip, i) => (
          <motion.div
            key={mip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.3 + i * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href={mip.href}
              aria-label={`Explore ${mip.id}: ${mip.title}`}
              className="group block bg-surface-elevated rounded-xl p-6 border border-border hover:border-text-tertiary/30 transition-all hover:shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs text-text-tertiary tracking-wider">
                  {mip.id}
                </span>
                {mip.beta && (
                  <span className="font-mono text-[10px] text-text-tertiary bg-surface px-2 py-0.5 rounded-full">
                    beta
                  </span>
                )}
              </div>

              {/* Mini visualization for MIP-8 */}
              {mip.id === "MIP-8" && (
                <div className="mb-3 w-48">
                  <MiniGrid />
                </div>
              )}

              <h2 className="text-xl font-medium mb-2 group-hover:text-solution-accent transition-colors">
                {mip.title}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {mip.description}
              </p>
              <span className="inline-block mt-3 font-mono text-xs text-text-tertiary group-hover:text-text-secondary transition-colors">
                Explore →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
