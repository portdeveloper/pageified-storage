"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useExplainMode } from "./ExplainModeContext";
import Hint from "./Hint";

export default function WhatIsBteSection() {
  const { mode } = useExplainMode();

  return (
    <AnimatePresence mode="sync">
      {mode === "simple" && (
        <motion.section
          key="what-is-bte"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="py-24 px-6 bg-surface relative">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                First, what&apos;s the problem?
              </h2>
              <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-6">
                Right now, everyone can see every pending transaction before it
                executes. Bots watch this queue and slip their own transactions
                ahead of yours. That&apos;s{" "}
                <Hint term="MEV">MEV</Hint>.
              </p>
              <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-6">
                The fix is to encrypt transactions so bots can&apos;t read them
                until the block is being built. But if the{" "}
                <Hint term="builder">builder</Hint> needs to execute them,
                someone still has to decrypt. Who?
              </p>
              <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-6">
                A group of servers. Each one holds a piece of the key. They
                work together to unscramble only the batch the builder picked.
                Everything else stays secret.
              </p>
              <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
                That&apos;s{" "}
                <Hint term="threshold encryption">threshold encryption</Hint>.
                BTX is a new construction that makes it small, fast,
                collision-free, and setup-free, all at once, for the first
                time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-5">
                  <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-2">
                    Without encryption
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Bots read every pending transaction and jump the queue.
                    Users pay more and sometimes get nothing.
                  </p>
                </div>
                <div className="bg-user-bg rounded-xl border border-user-cell p-5">
                  <p className="font-mono text-xs text-user-muted uppercase tracking-wider mb-2">
                    With threshold encryption
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Transactions are scrambled until the builder picks a batch.
                    Only that batch is unscrambled. The rest stay private.
                  </p>
                </div>
                <div className="bg-solution-bg rounded-xl border border-solution-cell p-5">
                  <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-2">
                    What BTX adds
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Short transactions, no dropped ones, no setup ceremony, and
                    fast enough to keep up with real blocks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
