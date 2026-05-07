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
    note: "More onchain interactions fit inside one product flow.",
    width: 92,
  },
  {
    label: "Block frequency",
    ethereum: "12 sec",
    monad: "400 ms",
    note: "Fast enough for subsecond feedback instead of loading screens.",
    width: 78,
  },
  {
    label: "Finality",
    ethereum: "12-18 min",
    monad: "800 ms",
    note: "Irreversible product decisions can settle quickly.",
    width: 86,
  },
  {
    label: "Gas throughput",
    ethereum: "2.5M gas/s",
    monad: "500M gas/s",
    note: "More contract work can happen without hiding chain latency.",
    width: 82,
  },
];

export default function Monad101Page() {
  return (
    <main className="bg-surface text-text-primary">
      <Hero />

      <VisualSection
        title="Same EVM surface, new engine underneath"
        copy={
          <p>
            Contracts, wallets, accounts, and RPC integrations stay familiar.
            Underneath, Monad is its own Layer 1 with its own validators, state,
            and ordered blocks.
          </p>
        }
      >
        <LayerMap />
      </VisualSection>

      <VisualSection
        title="The old path makes execution fight consensus for time"
        copy={
          <p>
            If execution sits on the consensus hot path, every block must leave
            room for compute, propagation, and voting. Monad separates those
            jobs into a pipeline.
          </p>
        }
      >
        <PipelineComparison />
      </VisualSection>

      <VisualSection
        title="Parallel work still commits to one serial answer"
        copy={
          <p>
            Execution can fan out across many workers, but results merge in the
            original transaction order. Conflicts re-run; contract semantics
            stay serial.
          </p>
        }
      >
        <ParallelExecutionDiagram />
      </VisualSection>

      <VisualSection
        title="Use block states as product confidence levels"
        copy={
          <p>
            Monad gives applications earlier signals for feedback and stronger
            signals for settlement, accounting, and delayed state-root
            assurance.
          </p>
        }
      >
        <BlockStatesDiagram />
      </VisualSection>

      <VisualSection
        title="Read the numbers as UX constraints"
        copy={
          <p>
            The headline metrics matter because they change what product teams
            can show immediately, settle quickly, and keep onchain.
          </p>
        }
      >
        <MetricsDiagram />
      </VisualSection>

      <VisualSection
        title="The surface carries over; assumptions need a pass"
        copy={
          <p>
            Start from normal EVM code, then re-check timing, gas, indexing,
            mempool, and block-state assumptions before shipping.
          </p>
        }
      >
        <CompatibilityGrid />
      </VisualSection>

      <NextSteps />
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
          EVM compatible surface. Pipelined consensus, parallel execution,
          fast state.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 mb-16 relative z-10 w-full max-w-5xl"
      >
        <PipelineHeroVisual />
      </motion.div>
    </section>
  );
}

function VisualSection({
  title,
  copy,
  children,
}: {
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

function BlockStatesDiagram() {
  const states = [
    {
      label: "Proposed",
      time: "latest",
      body: "Fast UI feedback",
      color: colors.userAccent,
    },
    {
      label: "Voted",
      time: "safe",
      body: "Stronger confidence",
      color: colors.problemAccentStrong,
    },
    {
      label: "Finalized",
      time: "finalized",
      body: "Settlement decisions",
      color: colors.solutionAccent,
    },
    {
      label: "Verified",
      time: "finalized - D",
      body: "Delayed root assurance",
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

// Horizontal movement means sequence; vertical pairing means overlap.
const HERO_TICK_MS = 1250;
const HERO_EASE = [0.16, 1, 0.3, 1] as const;
const HERO_CARD_W = 164;
const HERO_CARD_H = 62;
const HERO_COLUMNS = [
  { x: 72, consensusOffset: 0 },
  { x: 286, consensusOffset: 1 },
  { x: 500, consensusOffset: 2 },
  { x: 714, consensusOffset: 3 },
];

function blockLabel(offset: number) {
  if (offset === 0) return "N";
  if (offset > 0) return `N+${offset}`;
  return `N${offset}`;
}

function PipelineHeroVisual() {
  const shouldReduceMotion = !!useReducedMotion();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      const id = setTimeout(() => setFrame(1), 0);
      return () => clearTimeout(id);
    }
    const id = setInterval(() => {
      setFrame((current) => current + 1);
    }, HERO_TICK_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const activeIndex = shouldReduceMotion
    ? 1
    : (frame % (HERO_COLUMNS.length - 1)) + 1;
  const activeColumn = HERO_COLUMNS[activeIndex];
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.62, ease: HERO_EASE };
  const flowTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 1.1, ease: "linear", repeat: Infinity };

  return (
    <div className="bg-surface-elevated rounded-xl p-5 sm:p-6 shadow-sm border border-border">
      <svg
        role="img"
        aria-label="A two-lane pipeline showing consensus ordering the next block above execution of the current block at the same moment."
        viewBox="0 0 950 360"
        className="relative aspect-[2.64] w-full"
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
          x={8}
          y={8}
          width={934}
          height={344}
          rx={10}
          fill={colors.surface}
          stroke={colors.borderSoft}
        />

        <rect
          x={44}
          y={64}
          width={862}
          height={96}
          rx={8}
          fill={colors.userBg}
          opacity={0.5}
        />
        <rect
          x={44}
          y={198}
          width={862}
          height={96}
          rx={8}
          fill={colors.solutionBg}
          opacity={0.5}
        />

        <text
          x={64}
          y={52}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.userAccent}
        >
          consensus
        </text>
        <text
          x={64}
          y={186}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.solutionAccent}
        >
          execution
        </text>

        <motion.rect
          x={activeColumn.x - 14}
          y={48}
          width={HERO_CARD_W + 28}
          height={262}
          rx={8}
          fill={colors.surfaceElevated}
          opacity={0.7}
          stroke={colors.border}
          initial={false}
          animate={{ x: activeColumn.x - 14 }}
          transition={transition}
        />

        <motion.line
          x1={activeColumn.x + HERO_CARD_W / 2}
          x2={activeColumn.x + HERO_CARD_W / 2}
          y1={138}
          y2={220}
          stroke={colors.solutionAccent}
          strokeWidth="1.5"
          strokeDasharray="4 5"
          initial={false}
          animate={{
            x1: activeColumn.x + HERO_CARD_W / 2,
            x2: activeColumn.x + HERO_CARD_W / 2,
          }}
          transition={transition}
        />
        <motion.rect
          x={activeColumn.x + 38}
          y={164}
          width={88}
          height={24}
          rx={5}
          fill={colors.surface}
          stroke={colors.borderSoft}
          initial={false}
          animate={{ x: activeColumn.x + 38 }}
          transition={transition}
        />
        <motion.text
          x={activeColumn.x + HERO_CARD_W / 2}
          y={180}
          fontSize="10"
          fontFamily="monospace"
          fill={colors.textTertiary}
          textAnchor="middle"
          initial={false}
          animate={{ x: activeColumn.x + HERO_CARD_W / 2 }}
          transition={transition}
        >
          same moment
        </motion.text>

        {HERO_COLUMNS.slice(0, -1).map((column, index) => (
          <g key={`lane-arrow-${column.consensusOffset}`}>
            <motion.line
              x1={column.x + HERO_CARD_W + 10}
              x2={HERO_COLUMNS[index + 1].x - 10}
              y1={113}
              y2={113}
              stroke={colors.textTertiary}
              strokeWidth="1.3"
              strokeDasharray="5 7"
              markerEnd="url(#hero-arrow)"
              opacity={0.52}
              animate={{ strokeDashoffset: shouldReduceMotion ? 0 : -24 }}
              transition={flowTransition}
            />
            <motion.line
              x1={column.x + HERO_CARD_W + 10}
              x2={HERO_COLUMNS[index + 1].x - 10}
              y1={247}
              y2={247}
              stroke={colors.textTertiary}
              strokeWidth="1.3"
              strokeDasharray="5 7"
              markerEnd="url(#hero-arrow)"
              opacity={0.52}
              animate={{ strokeDashoffset: shouldReduceMotion ? 0 : -24 }}
              transition={flowTransition}
            />
          </g>
        ))}

        {HERO_COLUMNS.map((column, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          const consensusBlock = blockLabel(column.consensusOffset);
          const executionBlock = blockLabel(column.consensusOffset - 1);

          return (
            <g key={consensusBlock}>
              <motion.g
                initial={false}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.42 : 0.66,
                  y: isActive ? -3 : 0,
                }}
                transition={transition}
              >
                <rect
                  x={column.x}
                  y={82}
                  width={HERO_CARD_W}
                  height={HERO_CARD_H}
                  rx={7}
                  fill={isActive ? colors.userBg : colors.surfaceElevated}
                  stroke={isActive ? colors.userAccent : colors.border}
                  strokeWidth={isActive ? 1.6 : 1}
                />
                <text
                  x={column.x + HERO_CARD_W / 2}
                  y={108}
                  fontSize="12"
                  fontFamily="monospace"
                  fill={isActive ? colors.userAccent : colors.textPrimary}
                  textAnchor="middle"
                >
                  order Block {consensusBlock}
                </text>
                <text
                  x={column.x + HERO_CARD_W / 2}
                  y={127}
                  fontSize="9"
                  fontFamily="monospace"
                  fill={colors.textTertiary}
                  textAnchor="middle"
                >
                  official transaction order
                </text>
              </motion.g>

              <motion.g
                initial={false}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.42 : 0.66,
                  y: isActive ? 3 : 0,
                }}
                transition={transition}
              >
                <rect
                  x={column.x}
                  y={216}
                  width={HERO_CARD_W}
                  height={HERO_CARD_H}
                  rx={7}
                  fill={isActive ? colors.solutionBg : colors.surfaceElevated}
                  stroke={isActive ? colors.solutionAccent : colors.border}
                  strokeWidth={isActive ? 1.6 : 1}
                />
                <text
                  x={column.x + HERO_CARD_W / 2}
                  y={242}
                  fontSize="12"
                  fontFamily="monospace"
                  fill={isActive ? colors.solutionAccent : colors.textPrimary}
                  textAnchor="middle"
                >
                  execute Block {executionBlock}
                </text>
                <text
                  x={column.x + HERO_CARD_W / 2}
                  y={261}
                  fontSize="9"
                  fontFamily="monospace"
                  fill={colors.textTertiary}
                  textAnchor="middle"
                >
                  deterministic EVM result
                </text>
              </motion.g>
            </g>
          );
        })}

        <line
          x1={72}
          x2={878}
          y1={324}
          y2={324}
          stroke={colors.border}
          strokeWidth="1"
          markerEnd="url(#hero-arrow)"
        />
        <text
          x={475}
          y={336}
          fontSize="10"
          fontFamily="monospace"
          fill={colors.textTertiary}
          textAnchor="middle"
        >
          time moves right; each vertical pair is work happening in parallel
        </text>
      </svg>
    </div>
  );
}

function LayerMap() {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-3">
        <LayerRow
          title="EVM surface"
          subtitle="Solidity bytecode, ECDSA accounts, wallets, and RPC shape"
          muted
        />
        <LayerRow
          title="Monad L1 engine"
          subtitle="own validators, own state, fast ordered blocks"
          active
        />
        <LayerRow
          title="Canonical block result"
          subtitle="parallel work still lands as one serial EVM answer"
          muted
        />
      </div>
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {["EVM bytecode", "RPC shape", "ECDSA accounts", "Solidity tools"].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-solution-accent-light bg-solution-bg p-3"
          >
            <p className="font-mono text-[10px] text-solution-accent leading-snug">
              {item}
            </p>
          </div>
        ))}
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
              ["finalized block verifies N-D root", colors.problemAccentStrong, 0.24],
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
            <p className="font-mono text-[10px] text-text-tertiary">
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
      <p className="font-mono text-[10px] text-text-tertiary mb-4">
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
        <p className="font-mono text-[10px] text-text-tertiary mb-2">
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
          <h3 className="text-lg font-semibold text-solution-accent mb-4">
            Carries over
          </h3>
          <List
            items={[
              "Solidity and EVM bytecode model",
              "ECDSA accounts and existing wallets",
              "JSON-RPC integration shape",
              "Linear block transaction order",
            ]}
          />
        </div>
        <div className="rounded-xl bg-problem-bg border border-problem-cell-hover p-5">
          <h3 className="text-lg font-semibold text-problem-accent-strong mb-4">
            Re-check
          </h3>
          <List
            items={[
              "Gas is charged by gas limit",
              "Block tags map to Monad states",
              "Local mempool and propagation",
              "Indexer and historical-data assumptions",
              "Newly funded account timing",
            ]}
          />
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-surface border border-border p-4">
        <p className="text-sm text-text-secondary font-light leading-relaxed">
          Port the EVM app. Re-audit the timing model before treating it as production-ready.
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

function NextSteps() {
  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-3xl mb-8">
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
