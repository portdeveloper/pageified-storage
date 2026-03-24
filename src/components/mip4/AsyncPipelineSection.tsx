"use client";

import { motion } from "framer-motion";
import { useInView } from "../useInView";

const BLOCKS = [
  { label: "Block N-3", sub: "State known to consensus", status: "stale", balance: "100 MON" },
  { label: "Block N-2", sub: "Alice spends 95 MON", status: "unknown", balance: "5 MON" },
  { label: "Block N-1", sub: "Processing...", status: "unknown", balance: "5 MON" },
  { label: "Block N", sub: "Leader proposes Alice's tx", status: "current", balance: "?" },
];

export default function AsyncPipelineSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-alt relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Why reserve balance exists
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-2">
          Monad separates consensus from execution. When block N is proposed,
          the leader only has state from block N-3 (~1.2 seconds ago).
        </p>
        <p className="text-sm text-text-tertiary font-light max-w-3xl leading-relaxed mb-10">
          Without protection, a user could appear solvent on stale state but
          have already spent their funds. The 10 MON reserve ensures EOAs
          remain solvent across the async execution gap.
        </p>

        {/* Pipeline visualization */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {BLOCKS.map((block, i) => (
            <motion.div
              key={block.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-xl p-4 border ${
                block.status === "stale"
                  ? "bg-solution-bg border-solution-accent-light"
                  : block.status === "current"
                  ? "bg-problem-bg border-problem-cell-hover"
                  : "bg-surface-elevated border-border"
              }`}
            >
              <p className="font-mono text-xs font-semibold mb-1">{block.label}</p>
              <p className="text-sm text-text-secondary font-light mb-3">
                {block.sub}
              </p>
              <p className={`font-mono text-sm font-semibold ${
                block.status === "stale"
                  ? "text-solution-accent"
                  : block.status === "current"
                  ? "text-problem-accent"
                  : "text-text-tertiary"
              }`}>
                {block.balance}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Arrow flow */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-px flex-1 bg-border" />
          <p className="font-mono text-xs text-text-tertiary px-3">
            Leader sees 100 MON, but Alice actually has 5 MON
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Reserve explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-5">
            <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-3">
              Without reserve
            </p>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              Alice submits txs that pass consensus validation (she looks
              solvent) but fail during execution. Network wastes blockspace
              processing invalid transactions.
            </p>
          </div>
          <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-5">
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-3">
              With 10 MON reserve
            </p>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              Alice can only commit 10 MON in gas fees across the 3-block
              window. The leader rejects transactions that would exceed this
              budget, even on stale state.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
