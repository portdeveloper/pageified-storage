"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useInView } from "@/components/useInView";
import { colors } from "@/lib/colors";

const METRICS = [
  {
    label: "Throughput",
    ethereum: "~10 tx/s",
    monad: "10,000 tx/s",
    note: "Transfer and contract-call capacity.",
    width: 92,
  },
  {
    label: "Block frequency",
    ethereum: "12 sec",
    monad: "400 ms",
    note: "Fast enough to shape UI feedback.",
    width: 78,
  },
  {
    label: "Finality",
    ethereum: "12-18 min",
    monad: "800 ms",
    note: "Settlement-grade commitment.",
    width: 86,
  },
  {
    label: "Gas throughput",
    ethereum: "2.5M gas/s",
    monad: "500M gas/s",
    note: "Contract execution budget.",
    width: 82,
  },
];

const ARCHITECTURE = [
  {
    title: "MonadBFT",
    label: "consensus",
    body: "Agree on ordered blocks.",
    accent: colors.userAccent,
  },
  {
    title: "RaptorCast",
    label: "block delivery",
    body: "Move block chunks quickly.",
    accent: colors.textTertiary,
  },
  {
    title: "Deferred execution",
    label: "pipeline",
    body: "Order, execute beside, verify.",
    accent: colors.problemAccentStrong,
  },
  {
    title: "Parallel execution",
    label: "compute",
    body: "Work ahead, commit in order.",
    accent: colors.solutionAccent,
  },
  {
    title: "MonadDb",
    label: "state",
    body: "Fast Ethereum-state reads.",
    accent: colors.problemMuted,
  },
];

export default function Monad101Page() {
  return (
    <main className="bg-surface text-text-primary">
      <Hero />

      <VisualSection
        kicker="starting model"
        title="Many requests become one shared log"
        copy={
          <p>
            Transactions enter. Blocks order. Nodes replay.
          </p>
        }
      >
        <SharedLogVisual />
      </VisualSection>

      <VisualSection
        kicker="placement"
        title="Monad is an Ethereum-compatible Layer 1"
        copy={
          <p>
            Own validators and state. Ethereum bytecode, accounts, wallets,
            RPCs, and Solidity tools.
          </p>
        }
      >
        <LayerMap />
      </VisualSection>

      <VisualSection
        kicker="bottleneck"
        title="The usual design makes execution fight consensus for time"
        copy={
          <p>
            Monad orders first, executes beside later consensus work, then
            checks delayed state roots.
          </p>
        }
      >
        <PipelineComparison />
      </VisualSection>

      <VisualSection
        kicker="block states"
        title="A transaction moves through stronger commitments"
        copy={
          <p>
            Early states suit feedback. Stronger states suit settlement and
            accounting.
          </p>
        }
      >
        <BlockStatesDiagram />
      </VisualSection>

      <VisualSection
        kicker="architecture"
        title="Throughput comes from interlocking parts"
        copy={
          <p>
            Consensus, block delivery, execution, compilation, and storage each
            remove the next bottleneck.
          </p>
        }
      >
        <ArchitectureMap />
      </VisualSection>

      <VisualSection
        kicker="parallel execution"
        title="Parallel execution still commits to one serial answer"
        copy={
          <p>
            Work in parallel. Commit serially. Re-run conflicts.
          </p>
        }
      >
        <ParallelExecutionDiagram />
      </VisualSection>

      <VisualSection
        kicker="numbers"
        title="Read the numbers as interface constraints"
        copy={
          <p>
            Latency and capacity boundaries for product design.
          </p>
        }
      >
        <MetricsDiagram />
      </VisualSection>

      <VisualSection
        kicker="compatibility"
        title="EVM compatibility means the surface carries over, with edges"
        copy={
          <p>
            Code carries. Timing, gas, indexing, mempools, and verification
            need a new pass.
          </p>
        }
      >
        <CompatibilityGrid />
      </VisualSection>

      <CompactCardsSection
        kicker="rough edges"
        title="What is still young"
        intro="Mainnet is live. The surrounding ecosystem is still younger than Ethereum's."
      />

      <NextSteps />
      <Sources />
    </main>
  );
}

function Hero() {
  return (
    <section className="min-h-[82vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl relative z-10 mt-30"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-6">
          A shared computer,{" "}
          <span className="font-semibold italic">rebuilt around throughput.</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light max-w-xl mx-auto leading-relaxed">
          EVM-compatible surface. Pipelined consensus, parallel execution,
          fast state.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 mb-16 relative z-10 w-full max-w-2xl"
      >
        <PipelineHeroVisual />
      </motion.div>
    </section>
  );
}

function VisualSection({
  kicker,
  title,
  copy,
  children,
}: {
  kicker: string;
  title: string;
  copy: ReactNode;
  children: ReactNode;
}) {
  const { ref, isVisible } = useInView(0.12);

  return (
    <section className="px-6 py-16 bg-surface-alt">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] gap-9 lg:gap-14 items-center section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <div>
          <p className="font-mono text-xs text-text-tertiary uppercase mb-3">
            {kicker}
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">{title}</h2>
          <div className="text-base text-text-secondary font-light leading-relaxed">
            {copy}
          </div>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

function SharedLogVisual() {
  const steps = [
    {
      label: "requests",
      title: "Apps submit txs",
      items: ["transfer", "mint", "swap", "update"],
      accent: colors.userAccent,
    },
    {
      label: "ordering",
      title: "Block fixes order",
      items: ["1", "2", "3", "4"],
      accent: colors.problemAccentStrong,
    },
    {
      label: "replication",
      title: "Nodes replay",
      items: ["node A", "node B", "node C", "node D"],
      accent: colors.solutionAccent,
    },
  ];

  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div key={step.label} className="relative rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: step.accent }}
              />
              <p className="font-mono text-[10px] text-text-tertiary uppercase">
                {step.label}
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-4">{step.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {step.items.map((item, itemIndex) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.12 + itemIndex * 0.04 }}
                  className="rounded-md border border-border bg-surface-elevated px-2 py-2 text-center"
                >
                  <span className="font-mono text-[10px] text-text-primary">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute -right-3 top-1/2 h-px w-6 bg-border" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-solution-accent-light bg-solution-bg p-4">
        <p className="font-mono text-xs text-solution-accent">
          Same order. Same state.
        </p>
      </div>
    </div>
  );
}

function BlockStatesDiagram() {
  const states = [
    {
      label: "Proposed",
      time: "T",
      body: "Receipt can appear",
      color: colors.userAccent,
    },
    {
      label: "Voted",
      time: "T+1",
      body: "Speculative finality",
      color: colors.problemAccentStrong,
    },
    {
      label: "Finalized",
      time: "T+2",
      body: "No normal reorg",
      color: colors.solutionAccent,
    },
    {
      label: "Verified",
      time: "T+5",
      body: "State root agreed",
      color: colors.textPrimary,
    },
  ];

  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="hidden sm:block absolute left-[10%] right-[10%] top-[35px] h-px bg-border" />
        {states.map((state, index) => (
          <motion.div
            key={state.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="relative rounded-xl border border-border bg-surface p-4"
          >
            <div
              className="relative z-10 mb-5 h-9 w-9 rounded-full border-4 border-surface flex items-center justify-center"
              style={{ backgroundColor: state.color }}
            >
              <span className="font-mono text-[10px] font-semibold text-surface">
                {index + 1}
              </span>
            </div>
            <p className="font-mono text-[10px] text-text-tertiary mb-1">
              {state.time}
            </p>
            <h3 className="text-lg font-semibold mb-2">{state.label}</h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              {state.body}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Tick-driven hero animation. The loop tells one story:
// familiar Ethereum-shaped txs enter, consensus orders a block, execution fans
// out beside the next consensus slot, then results merge into one EVM state.
const HERO_TICK_MS = 1150;
const HERO_TICKS = 6;
const HERO_BAR_START = 216;
const HERO_BAR_W = 220;
const HERO_EASE = [0.16, 1, 0.3, 1] as const;

const HERO_INPUT_TXS = [
  { id: "swap", y: 112, tone: colors.userAccent },
  { id: "mint", y: 142, tone: colors.solutionAccent },
  { id: "send", y: 172, tone: colors.problemAccentStrong },
  { id: "call", y: 202, tone: colors.textTertiary },
];

const HERO_EXEC_TXS = [
  { id: "swap", y: 204, width: 196, commitX: 472, retry: true },
  { id: "mint", y: 234, width: 176, commitX: 520 },
  { id: "send", y: 264, width: 210, commitX: 568 },
  { id: "call", y: 294, width: 158, commitX: 616 },
];

const HERO_METRICS = [
  ["10,000", "tx/s"],
  ["400ms", "blocks"],
  ["800ms", "finality"],
  ["EVM", "compatible"],
];

function PipelineHeroVisual() {
  const shouldReduceMotion = !!useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      const id = setTimeout(() => setFrame(4), 0);
      return () => clearTimeout(id);
    }
    const id = setInterval(() => {
      setFrame((current) => current + 1);
    }, HERO_TICK_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const tick = frame % HERO_TICKS;
  const cycle = Math.floor(frame / HERO_TICKS);
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.58, ease: HERO_EASE };

  const statusByTick = [
    "Ethereum-shaped txs enter",
    "consensus seals Block N",
    "Block N executes beside Block N+1",
    "parallel results merge in order",
    "one canonical EVM state",
    "next block enters the pipeline",
  ];

  return (
    <div className="bg-surface-elevated rounded-xl p-5 sm:p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-problem-accent shrink-0" />
          <p className="font-mono text-[11px] text-text-tertiary truncate">
            {statusByTick[tick]}
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-text-tertiary shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-user-accent" />
            consensus
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-solution-accent" />
            execution
          </span>
        </div>
      </div>

      <svg
        key={cycle}
        role="img"
        aria-label="A pipeline diagram showing familiar Ethereum transactions entering Monad, consensus ordering Block N, execution running in parallel beside consensus for Block N plus one, results merging serially, and one canonical EVM state being produced."
        viewBox="0 0 680 380"
        className="relative aspect-[1.79] w-full"
      >
        <defs>
          <marker
            id="hero-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.textTertiary} />
          </marker>
        </defs>

        <rect
          x={18}
          y={42}
          width={644}
          height={292}
          rx={10}
          fill={colors.surface}
          stroke={colors.borderSoft}
        />

        <line
          x1={42}
          x2={638}
          y1={164}
          y2={164}
          stroke={colors.borderSoft}
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        <text
          x={42}
          y={76}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.textTertiary}
          letterSpacing="1.5"
        >
          EVM INPUT
        </text>
        <text
          x={214}
          y={76}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.userAccent}
          letterSpacing="1.5"
        >
          CONSENSUS
        </text>
        <text
          x={214}
          y={174}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.solutionAccent}
          letterSpacing="1.5"
        >
          EXECUTION
        </text>
        <text
          x={488}
          y={174}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.textTertiary}
          letterSpacing="1.5"
        >
          COMMIT
        </text>

        {HERO_INPUT_TXS.map((tx, index) => (
          <motion.g
            key={tx.id}
            initial={{ opacity: 0, x: -18 }}
            animate={{
              opacity: tick <= 2 ? 1 : 0.16,
              x: tick >= 1 ? 10 : 0,
            }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : index * 0.04 }}
          >
            <rect
              x={42}
              y={tx.y - 13}
              width={96}
              height={26}
              rx={5}
              fill={colors.surfaceElevated}
              stroke={tx.tone}
            />
            <circle cx={58} cy={tx.y} r={4} fill={tx.tone} />
            <text
              x={70}
              y={tx.y + 4}
              fontSize="10"
              fontFamily="monospace"
              fill={colors.textPrimary}
            >
              {tx.id}
            </text>
          </motion.g>
        ))}

        <motion.line
          x1={150}
          x2={204}
          y1={176}
          y2={176}
          stroke={colors.textTertiary}
          strokeWidth="1.5"
          strokeDasharray="4 5"
          markerEnd="url(#hero-arrow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: tick >= 1 ? 0.65 : 0 }}
          transition={transition}
        />

        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: tick >= 1 ? 1 : 0, y: tick >= 1 ? 0 : 8 }}
          transition={transition}
        >
          <rect
            x={204}
            y={104}
            width={156}
            height={46}
            rx={7}
            fill={colors.userBg}
            stroke={colors.userAccent}
          />
          <text
            x={282}
            y={124}
            fontSize="12"
            fontFamily="monospace"
            fill={colors.userAccent}
            textAnchor="middle"
          >
            Block N
          </text>
          <text
            x={282}
            y={140}
            fontSize="9"
            fontFamily="monospace"
            fill={colors.textTertiary}
            textAnchor="middle"
          >
            ordered in consensus
          </text>
        </motion.g>

        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: tick >= 2 ? 1 : 0, y: tick >= 2 ? 0 : 8 }}
          transition={transition}
        >
          <rect
            x={398}
            y={104}
            width={156}
            height={46}
            rx={7}
            fill={colors.surfaceElevated}
            stroke={colors.border}
          />
          <text
            x={476}
            y={124}
            fontSize="12"
            fontFamily="monospace"
            fill={colors.textPrimary}
            textAnchor="middle"
          >
            Block N+1
          </text>
          <text
            x={476}
            y={140}
            fontSize="9"
            fontFamily="monospace"
            fill={colors.textTertiary}
            textAnchor="middle"
          >
            ordering starts
          </text>
        </motion.g>

        <motion.line
          x1={360}
          x2={398}
          y1={127}
          y2={127}
          stroke={colors.border}
          strokeWidth="1.5"
          markerEnd="url(#hero-arrow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: tick >= 2 ? 0.9 : 0 }}
          transition={transition}
        />

        {HERO_EXEC_TXS.map((tx, index) => (
          <g key={tx.id}>
            <text
              x={198}
              y={tx.y + 4}
              fontSize="10"
              fontFamily="monospace"
              fill={colors.textTertiary}
              textAnchor="end"
            >
              {tx.id}
            </text>
            <rect
              x={HERO_BAR_START}
              y={tx.y - 8}
              width={HERO_BAR_W}
              height={16}
              rx={8}
              fill={colors.borderSoft}
            />
            <motion.rect
              x={HERO_BAR_START}
              y={tx.y - 8}
              height={16}
              rx={8}
              fill={colors.solutionAccentLight}
              initial={{ width: 0, opacity: 0 }}
              animate={{
                width: tick >= 2 ? tx.width : 0,
                opacity: tick >= 2 ? 1 : 0,
              }}
              transition={{ ...transition, delay: shouldReduceMotion ? 0 : index * 0.08 }}
            />
            {tx.retry && (
              <motion.g
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{
                  opacity: tick === 3 ? 1 : 0,
                  scale: tick === 3 ? 1 : 0.88,
                }}
                transition={transition}
              >
                <rect
                  x={HERO_BAR_START + 82}
                  y={tx.y - 14}
                  width={48}
                  height={28}
                  rx={5}
                  fill={colors.problemBg}
                  stroke={colors.problemAccentStrong}
                />
                <text
                  x={HERO_BAR_START + 106}
                  y={tx.y + 4}
                  fontSize="9"
                  fontFamily="monospace"
                  fill={colors.problemAccentStrong}
                  textAnchor="middle"
                >
                  retry
                </text>
              </motion.g>
            )}
            <motion.line
              x1={HERO_BAR_START + tx.width + 8}
              x2={tx.commitX}
              y1={tx.y}
              y2={320}
              stroke={colors.textTertiary}
              strokeWidth="1"
              strokeDasharray="3 5"
              initial={{ opacity: 0 }}
              animate={{ opacity: tick >= 3 ? 0.42 : 0 }}
              transition={transition}
            />
          </g>
        ))}

        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: tick >= 3 ? 1 : 0, y: tick >= 3 ? 0 : 10 }}
          transition={transition}
        >
          <line
            x1={462}
            x2={616}
            y1={320}
            y2={320}
            stroke={colors.textPrimary}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {HERO_EXEC_TXS.map((tx, index) => (
            <g key={`${tx.id}-commit`}>
              <circle
                cx={tx.commitX}
                cy={320}
                r={12}
                fill={colors.surfaceElevated}
                stroke={colors.textPrimary}
                strokeWidth="1.5"
              />
              <text
                x={tx.commitX}
                y={324}
                fontSize="10"
                fontFamily="monospace"
                fill={colors.textPrimary}
                textAnchor="middle"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </motion.g>

        <motion.g
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{
            opacity: tick >= 4 ? 1 : 0,
            scale: tick >= 4 ? 1 : 0.96,
          }}
          transition={transition}
        >
          <rect
            x={482}
            y={218}
            width={142}
            height={58}
            rx={8}
            fill={colors.solutionBg}
            stroke={colors.solutionAccent}
          />
          <text
            x={553}
            y={242}
            fontSize="12"
            fontFamily="monospace"
            fill={colors.solutionAccent}
            textAnchor="middle"
          >
            canonical state
          </text>
          <text
            x={553}
            y={258}
            fontSize="9"
            fontFamily="monospace"
            fill={colors.textTertiary}
            textAnchor="middle"
          >
            same serial EVM result
          </text>
        </motion.g>

        <motion.line
          x1={554}
          x2={554}
          y1={286}
          y2={304}
          stroke={colors.solutionAccent}
          strokeWidth="1.5"
          markerEnd="url(#hero-arrow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: tick >= 4 ? 0.75 : 0 }}
          transition={transition}
        />

        <motion.text
          x={340}
          y={360}
          fontSize="10"
          fontFamily="monospace"
          fill={colors.textTertiary}
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: tick >= 5 ? 1 : 0 }}
          transition={transition}
        >
          fresh blocks keep sliding through the same pipeline
        </motion.text>
      </svg>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-4 gap-2">
          {HERO_METRICS.map(([value, label]) => (
            <div key={value} className="min-w-0">
              <p className="font-mono text-xs sm:text-sm font-semibold text-text-primary tabular-nums leading-none">
                {value}
              </p>
              <p className="mt-1 font-mono text-[9px] text-text-tertiary uppercase truncate">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function LayerMap() {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-3">
        <LayerRow
          title="Layer 2"
          subtitle="uses another base network for settlement or data"
          muted
        />
        <LayerRow
          title="Monad"
          subtitle="own validators and state, Ethereum-compatible developer surface"
          active
        />
        <LayerRow
          title="Different-runtime L1"
          subtitle="own validators and state, different application model"
          muted
        />
      </div>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {["EVM bytecode", "Ethereum RPC", "ECDSA addresses", "Solidity tools"].map(
          (item) => (
            <div
              key={item}
              className="rounded-lg border border-solution-accent-light bg-solution-bg p-3"
            >
              <p className="font-mono text-[10px] text-solution-accent leading-snug">
                {item}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function LayerRow({
  title,
  subtitle,
  active,
  muted,
}: {
  title: string;
  subtitle: string;
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        active
          ? "border-solution-accent bg-solution-bg"
          : muted
            ? "border-border bg-surface"
            : "border-border bg-surface-elevated"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`font-mono text-xs mb-1 ${
              active ? "text-solution-accent" : "text-text-primary"
            }`}
          >
            {title}
          </p>
          <p className="text-sm text-text-secondary font-light leading-relaxed">
            {subtitle}
          </p>
        </div>
        {active && (
          <span className="font-mono text-[10px] text-solution-accent border border-solution-accent-light rounded-full px-2 py-1">
            this page
          </span>
        )}
      </div>
    </div>
  );
}

function PipelineComparison() {
  const { ref, isVisible } = useInView(0.2);

  return (
    <div ref={ref} className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <TimelineCard title="Interleaved" subtitle="execute before voting">
          <div className="space-y-4">
            <SegmentedBar
              isVisible={isVisible}
              segments={[
                ["execute", 26, colors.problemAccentLight],
                ["propose", 22, colors.userAccent],
                ["execute", 24, colors.problemAccentLight],
                ["vote", 28, colors.textTertiary],
              ]}
            />
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              Execution shares the same interval with network communication and
              voting.
            </p>
          </div>
        </TimelineCard>

        <TimelineCard title="Monad pipeline" subtitle="order first, execute beside">
          <div className="space-y-3">
            {[
              ["consensus orders block N", colors.userAccent, 0],
              ["execution processes block N-1", colors.solutionAccent, 0.12],
              ["state root verifies earlier block", colors.problemAccentStrong, 0.24],
            ].map(([label, color, delay]) => (
              <motion.div
                key={label}
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: 1 } : {}}
                transition={{ duration: 0.78, delay: Number(delay), ease: [0.16, 1, 0.3, 1] }}
                className="h-10 origin-left rounded-lg border border-border flex items-center px-3"
                style={{ backgroundColor: String(color) }}
              >
                <span className="font-mono text-[10px] text-surface font-semibold">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </TimelineCard>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {["order", "execute", "verify"].map((step, index) => (
          <div key={step} className="rounded-lg bg-surface border border-border p-3">
            <p className="font-mono text-lg text-text-primary tabular-nums">
              {index + 1}
            </p>
            <p className="font-mono text-[10px] text-text-tertiary uppercase">
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <p className="font-mono text-xs text-text-primary mb-1">{title}</p>
      <p className="font-mono text-[10px] text-text-tertiary uppercase mb-4">
        {subtitle}
      </p>
      {children}
    </div>
  );
}

function SegmentedBar({
  segments,
  isVisible,
}: {
  segments: [string, number, string][];
  isVisible: boolean;
}) {
  return (
    <div className="h-14 rounded-lg overflow-hidden border border-border bg-surface-elevated flex">
      {segments.map(([label, width, color], index) => (
        <motion.div
          key={`${label}-${index}`}
          initial={{ width: 0 }}
          animate={isVisible ? { width: `${width}%` } : {}}
          transition={{ duration: 0.62, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative border-r border-surface-elevated last:border-r-0"
          style={{ backgroundColor: color }}
        >
          <span className="absolute inset-x-1 top-1/2 -translate-y-1/2 text-center font-mono text-[9px] text-text-primary/75">
            {width > 20 ? label : ""}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ArchitectureMap() {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ARCHITECTURE.map((part, index) => (
          <motion.div
            key={part.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: index * 0.06 }}
            className={`rounded-xl border border-border bg-surface p-4 ${
              index === ARCHITECTURE.length - 1 ? "sm:col-span-2" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: part.accent }}
              />
              <p className="font-mono text-[10px] text-text-tertiary uppercase">
                {part.label}
              </p>
            </div>
            <h3 className="text-lg font-semibold mb-2">{part.title}</h3>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              {part.body}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ParallelExecutionDiagram() {
  const { ref, isVisible } = useInView(0.22);
  const transactions = [
    { label: "A", lane: "profile", conflict: false },
    { label: "B", lane: "pool", conflict: true },
    { label: "C", lane: "badge", conflict: false },
    { label: "D", lane: "pool", conflict: true },
    { label: "E", lane: "order", conflict: false },
    { label: "F", lane: "game", conflict: false },
  ];

  return (
    <div ref={ref} className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-3">
        {transactions.map((tx, index) => (
          <div key={tx.label} className="grid grid-cols-[42px_minmax(0,1fr)_86px] items-center gap-3">
            <div className="rounded-lg bg-surface border border-border h-10 flex items-center justify-center">
              <span className="font-mono text-xs text-text-primary">tx {tx.label}</span>
            </div>
            <div className="h-7 rounded-full bg-border/60 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isVisible ? { scaleX: tx.conflict ? 0.72 : 1 } : {}}
                transition={{ duration: 0.75, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="h-full origin-left rounded-full"
                style={{
                  backgroundColor: tx.conflict
                    ? colors.problemAccentLight
                    : colors.solutionAccentLight,
                }}
              />
            </div>
            <div
              className={`rounded-lg border p-2 text-center ${
                tx.conflict
                  ? "border-problem-cell-hover bg-problem-bg"
                  : "border-solution-accent-light bg-solution-bg"
              }`}
            >
              <p
                className={`font-mono text-[10px] ${
                  tx.conflict ? "text-problem-accent-strong" : "text-solution-accent"
                }`}
              >
                {tx.conflict ? "re-run" : "commit"}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-surface border border-border p-4">
        <p className="font-mono text-[10px] text-text-tertiary uppercase mb-2">
          commit order
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {transactions.map((tx, index) => (
            <div key={`${tx.label}-order`} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-text-primary text-surface font-mono text-xs flex items-center justify-center">
                {tx.label}
              </div>
              {index < transactions.length - 1 && (
                <div className="h-px w-4 bg-border" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-text-secondary font-light leading-relaxed">
          Parallel work produces candidates. Serial commit preserves the block&apos;s
          official transaction order.
        </p>
      </div>
    </div>
  );
}

function MetricsDiagram() {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="space-y-4">
        {METRICS.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            className="rounded-xl bg-surface border border-border p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
              <div>
                <p className="font-mono text-xs text-text-primary">{metric.label}</p>
                <p className="font-mono text-[10px] text-text-tertiary">
                  Ethereum reference: {metric.ethereum}
                </p>
              </div>
              <p className="font-mono text-xl font-semibold text-solution-accent tabular-nums">
                {metric.monad}
              </p>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden mb-3">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: metric.width / 100 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 + index * 0.06 }}
                className="h-full origin-left rounded-full bg-solution-accent"
              />
            </div>
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              {metric.note}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CompatibilityGrid() {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-solution-bg border border-solution-accent-light p-5">
          <p className="font-mono text-xs text-solution-accent uppercase mb-4">
            carries over
          </p>
          <List
            items={[
              "Solidity and EVM bytecode model",
              "Ethereum accounts and wallets",
              "JSON-RPC integration shape",
              "Familiar deployment flow",
            ]}
          />
        </div>
        <div className="rounded-xl bg-problem-bg border border-problem-cell-hover p-5">
          <p className="font-mono text-xs text-problem-accent-strong uppercase mb-4">
            re-check
          </p>
          <List
            items={[
              "Gas is charged by gas limit",
              "Opcode and precompile pricing",
              "Local mempool behavior",
              "Verified roots for accounting",
            ]}
          />
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-surface border border-border p-4">
        <p className="font-mono text-[10px] text-text-tertiary uppercase mb-2">
          practical read
        </p>
        <p className="text-sm text-text-secondary font-light leading-relaxed">
          Start with known EVM code. Test with Monad-specific tooling.
        </p>
      </div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-text-tertiary shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function FrictionCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-surface-elevated border border-border p-5">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <p className="text-sm text-text-secondary font-light leading-relaxed">
        {body}
      </p>
    </div>
  );
}

function CompactCardsSection({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: string;
  intro: string;
}) {
  const { ref, isVisible } = useInView(0.12);

  return (
    <section className="px-6 py-16">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <div className="max-w-2xl mb-8">
          <p className="font-mono text-xs text-text-tertiary uppercase mb-3">
            {kicker}
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">{title}</h2>
          <p className="text-base text-text-secondary font-light leading-relaxed">
            {intro}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FrictionCard
            title="Tooling has versions"
            body="Use Monad Foundry for local truth."
          />
          <FrictionCard
            title="Indexing is real work"
            body="Data pipelines become infrastructure."
          />
          <FrictionCard
            title="Assumptions leak"
            body="Global pending streams map poorly to local mempools."
          />
        </div>
      </div>
    </section>
  );
}

function NextSteps() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl mb-8">
          <p className="font-mono text-xs text-text-tertiary uppercase mb-3">
            next step
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-5">
            Where next
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NextCard
            href="/async-execution"
            title="Understand the pipeline"
            body="Consensus first, execution beside."
          />
          <NextCard
            href="/mip-4"
            title="See a developer edge"
            body="Reserve balance and deferred execution."
          />
          <NextCard
            href="https://docs.monad.xyz/developer-essentials/summary"
            title="Deploy deliberately"
            body="Port contracts and infra assumptions."
            external
          />
        </div>
      </div>
    </section>
  );
}

function NextCard({
  href,
  title,
  body,
  external,
}: {
  href: string;
  title: string;
  body: string;
  external?: boolean;
}) {
  const className =
    "group block rounded-xl bg-surface-elevated border border-border p-5 hover:border-text-tertiary/50 transition-colors h-full";
  const content = (
    <>
      <h3 className="text-lg font-semibold mb-3 group-hover:text-solution-accent transition-colors">
        {title}
      </h3>
      <p className="text-sm text-text-secondary font-light leading-relaxed mb-4">
        {body}
      </p>
      <span className="font-mono text-xs text-text-tertiary group-hover:text-text-primary transition-colors">
        Open -&gt;
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function Sources() {
  return (
    <section className="px-6 pb-24">
      <div className="max-w-5xl mx-auto border-t border-border pt-6">
        <p className="font-mono text-[10px] text-text-tertiary uppercase mb-3">
          source notes
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] text-text-tertiary">
          <a
            href="https://docs.monad.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            Monad docs: introduction
          </a>
          <a
            href="https://docs.monad.xyz/developer-essentials/summary"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            deployment summary
          </a>
          <a
            href="https://docs.monad.xyz/monad-arch/execution/parallel-execution"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            parallel execution
          </a>
          <a
            href="https://docs.monad.xyz/monad-arch/consensus/asynchronous-execution"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            async execution
          </a>
          <a
            href="https://docs.monad.xyz/monad-arch/execution/monaddb"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            MonadDb
          </a>
        </div>
      </div>
    </section>
  );
}
