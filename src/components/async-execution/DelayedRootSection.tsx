"use client";

import { motion } from "framer-motion";
import { useInView } from "@/components/useInView";
import { colors } from "@/lib/colors";

const BLOCKS = [
  { label: "N-3", state: "executed", root: "state root known" },
  { label: "N-2", state: "executing", root: "local execution" },
  { label: "N-1", state: "queued", root: "not checked yet" },
  { label: "N", state: "proposal", root: "includes root for N-3" },
];

export default function DelayedRootSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-14 items-center">
          <div>
            <p className="font-mono text-xs text-text-tertiary uppercase mb-3">
              delayed Merkle root
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
              The pipeline still checks state
            </h2>
            <p className="text-lg text-text-secondary font-light leading-relaxed mb-4">
              Monad block proposals do not need the state root for the block
              being proposed. Instead, a proposal includes the Merkle root from
              three blocks earlier.
            </p>
            <p className="text-sm text-text-tertiary font-light leading-relaxed">
              With{" "}
              <code className="font-mono text-xs bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                D = 3
              </code>
              , block{" "}
              <code className="font-mono text-xs bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                N
              </code>{" "}
              carries the root for{" "}
              <code className="font-mono text-xs bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
                N-3
              </code>
              . If execution diverged, validators can reject the proposal and
              the bad node can roll back and re-execute from the last good
              state.
            </p>
          </div>

          <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 mb-8">
              {BLOCKS.map((block, index) => (
                <motion.div
                  key={block.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`relative min-h-[118px] rounded-xl border p-3 overflow-hidden ${
                    index === 0
                      ? "bg-solution-bg border-solution-accent-light"
                      : index === 3
                        ? "bg-problem-bg border-problem-cell-hover"
                        : "bg-surface border-border"
                  }`}
                >
                  <p className="font-mono text-lg font-semibold text-text-primary">
                    {block.label}
                  </p>
                  <p className="font-mono text-[10px] text-text-tertiary mt-1">
                    {block.state}
                  </p>
                  <p
                    className={`font-mono text-[10px] leading-snug mt-4 ${
                      index === 0
                        ? "text-solution-accent"
                        : index === 3
                          ? "text-problem-accent-strong"
                          : "text-text-tertiary"
                    }`}
                  >
                    {block.root}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="relative h-24">
              <div className="absolute left-[12.5%] right-[12.5%] top-8 h-px bg-border" />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-[12.5%] right-[12.5%] top-8 h-0.5 origin-left"
                style={{ backgroundColor: colors.solutionAccent }}
              />
              <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={
                  isVisible
                    ? {
                        opacity: [0, 1, 1],
                        left: ["12%", "52%", "88%"],
                      }
                    : {}
                }
                transition={{
                  duration: 1.4,
                  delay: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute top-[1.55rem] z-10 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors.solutionAccent }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 1 }}
                className="absolute left-[8%] top-0 rounded-lg bg-solution-bg border border-solution-accent-light px-3 py-2"
              >
                <p className="font-mono text-[10px] text-solution-accent">
                  root(N-3)
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 1.15 }}
                className="absolute right-[4%] top-12 rounded-lg bg-surface border border-border px-3 py-2"
              >
                <p className="font-mono text-[10px] text-text-tertiary">
                  checked inside block N
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
