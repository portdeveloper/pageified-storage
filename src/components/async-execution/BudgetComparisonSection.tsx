"use client";

import { motion } from "framer-motion";
import { useInView } from "@/components/useInView";
import { colors } from "@/lib/colors";

const INTERLEAVED_STEPS = [
  { label: "leader executes", width: 14, color: colors.problemAccentLight },
  { label: "proposal", width: 20, color: colors.problemAccent },
  { label: "validators execute", width: 14, color: colors.problemAccentLight },
  { label: "votes", width: 34, color: colors.userAccent },
  { label: "buffer", width: 18, color: colors.border },
];

const ASYNC_STEPS = [
  { label: "consensus orders block N", width: 100, color: colors.userAccent },
  { label: "execution processes block N-1", width: 100, color: colors.solutionAccent },
];

export default function BudgetComparisonSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-alt relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <div className="max-w-3xl mb-10">
          <p className="font-mono text-xs text-text-tertiary uppercase mb-3">
            block-time budget
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Interleaved execution wastes the clock
          </h2>
          <p className="text-lg text-text-secondary font-light leading-relaxed">
            In the interleaved model, execution sits on the consensus hot path:
            the leader executes before proposing, then validators execute before
            voting. Monad removes that dependency, so consensus and execution
            both occupy the block interval in separate lanes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TimelineCard
            title="Interleaved"
            subtitle="execution blocks consensus"
            note="Execution must fit into a small, conservative slice of the block time."
            isVisible={isVisible}
          >
            <div className="h-32 flex flex-col justify-center">
              <div className="flex h-14 rounded-xl overflow-hidden border border-border bg-surface">
                {INTERLEAVED_STEPS.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ width: 0 }}
                    animate={isVisible ? { width: `${step.width}%` } : {}}
                    transition={{
                      duration: 0.7,
                      delay: 0.15 + index * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="relative border-r border-surface-elevated last:border-r-0"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="absolute inset-x-1 top-1/2 -translate-y-1/2 text-center font-mono text-[9px] leading-tight text-text-primary/80">
                      {step.width >= 18 ? step.label : ""}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <p className="font-mono text-[10px] text-text-tertiary">
                  one block interval
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          </TimelineCard>

          <TimelineCard
            title="Asynchronous"
            subtitle="execution runs beside consensus"
            note="Consensus agrees on ordering; execution catches up with a full interval of budget."
            isVisible={isVisible}
          >
            <div className="space-y-3 h-32 flex flex-col justify-center">
              {ASYNC_STEPS.map((step, index) => (
                <div key={step.label}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isVisible ? { scaleX: 1 } : {}}
                    transition={{
                      duration: 0.9,
                      delay: 0.2 + index * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-10 rounded-xl origin-left border border-border flex items-center px-3"
                    style={{ backgroundColor: step.color }}
                  >
                    <span className="font-mono text-[10px] text-surface font-semibold">
                      {step.label}
                    </span>
                  </motion.div>
                </div>
              ))}
            </div>
          </TimelineCard>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ["Ordering only", "Consensus chooses the official transaction sequence."],
            ["Execution later", "Nodes execute the same sequence locally, slightly behind."],
            ["State check", "Delayed roots keep execution divergence detectable."],
          ].map(([title, body]) => (
            <div
              key={title}
              className="bg-surface-elevated rounded-xl border border-border p-5"
            >
              <p className="font-mono text-xs text-text-tertiary uppercase mb-2">
                {title}
              </p>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineCard({
  title,
  subtitle,
  note,
  isVisible,
  children,
}: {
  title: string;
  subtitle: string;
  note: string;
  isVisible: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="bg-surface-elevated rounded-2xl border border-border p-5 sm:p-6"
    >
      <p className="font-mono text-xs text-text-primary mb-1">{title}</p>
      <p className="font-mono text-[10px] text-text-tertiary uppercase mb-5">
        {subtitle}
      </p>
      {children}
      <p className="text-sm text-text-secondary font-light leading-relaxed mt-5">
        {note}
      </p>
    </motion.div>
  );
}
