"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
        className="mt-12 mb-16 relative z-10 w-full max-w-2xl"
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

const HERO_EASE = [0.16, 1, 0.3, 1] as const;
const SLIDE_W = 640;
const SLIDE_H = 360;
const SLIDE_DURATION_MS = 8000;

type SlideProps = { shouldReduceMotion: boolean };

const SLIDES: {
  key: string;
  title: string;
  note: string;
  Component: (props: SlideProps) => React.ReactNode;
}[] = [
  {
    key: "raptorcast",
    title: "RaptorCast",
    note: "one block, erasure-coded chunks, every validator",
    Component: RaptorCastSlide,
  },
  {
    key: "parallel",
    title: "Parallel execution",
    note: "transactions run in parallel, commits stay serial",
    Component: ParallelSlide,
  },
  {
    key: "pipeline",
    title: "Async execution pipeline",
    note: "consensus orders the next block while execution runs the last",
    Component: PipelineSlide,
  },
];

function PipelineHeroVisual() {
  const shouldReduceMotion = !!useReducedMotion();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const id = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [shouldReduceMotion]);

  const current = SLIDES[slide];
  const Current = current.Component;

  return (
    <div className="bg-surface-elevated rounded-xl p-5 sm:p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-4 min-h-[18px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${current.key}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 min-w-0"
          >
            <p className="font-mono text-[11px] text-text-primary shrink-0">
              {current.title}
            </p>
            <span className="font-mono text-[11px] text-text-tertiary truncate">
              {current.note}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative w-full" style={{ aspectRatio: `${SLIDE_W} / ${SLIDE_H}` }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <Current shouldReduceMotion={shouldReduceMotion} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDES.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === slide ? "w-6 bg-solution-accent" : "w-1.5 bg-border"
            }`}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

function RaptorCastSlide({ shouldReduceMotion }: SlideProps) {
  const centerX = SLIDE_W / 2;
  const centerY = SLIDE_H / 2;
  const validatorCount = 8;
  const validatorRadius = 134;
  const validators = Array.from({ length: validatorCount }, (_, i) => {
    const angle = (i / validatorCount) * Math.PI * 2 - Math.PI / 2;
    return {
      id: i,
      x: centerX + Math.cos(angle) * validatorRadius,
      y: centerY + Math.sin(angle) * validatorRadius,
    };
  });

  const blockW = 84;
  const blockH = 50;
  const chunksPerLane = 3;
  const chunkPeriod = 1.6;
  const chunkSize = 5;

  const chunks = validators.flatMap((v) =>
    Array.from({ length: chunksPerLane }, (_, i) => {
      const phaseOffset = (v.id * 0.213) % 1;
      const inLanePhase = i / chunksPerLane;
      const delay = ((inLanePhase + phaseOffset) % 1) * chunkPeriod;
      return {
        key: `${v.id}-${i}`,
        dx: v.x - centerX,
        dy: v.y - centerY,
        delay,
      };
    })
  );

  return (
    <svg
      role="img"
      aria-label="A central leader block emits a continuous stream of small erasure-coded chunks that fan out to a ring of eight validators."
      viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`}
      className="w-full h-full"
    >
      {validators.map((v) => (
        <line
          key={`line-${v.id}`}
          x1={centerX}
          y1={centerY}
          x2={v.x}
          y2={v.y}
          stroke={colors.borderSoft}
          strokeWidth="0.6"
          strokeDasharray="2 5"
          opacity={0.55}
        />
      ))}

      {validators.map((v) => (
        <g key={`v-${v.id}`}>
          <circle
            cx={v.x}
            cy={v.y}
            r={16}
            fill={colors.solutionBg}
            stroke={colors.solutionAccent}
            strokeWidth="1.4"
          />
          <text
            x={v.x}
            y={v.y + 4}
            fontSize="11"
            fontFamily="monospace"
            fill={colors.solutionAccent}
            textAnchor="middle"
          >
            v{v.id + 1}
          </text>
        </g>
      ))}

      {!shouldReduceMotion &&
        chunks.map((c) => (
          <motion.rect
            key={c.key}
            x={centerX - chunkSize / 2}
            y={centerY - chunkSize / 2}
            width={chunkSize}
            height={chunkSize}
            rx={1.2}
            fill={colors.solutionAccent}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, c.dx * 0.02, c.dx * 0.98, c.dx],
              y: [0, c.dy * 0.02, c.dy * 0.98, c.dy],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: chunkPeriod,
              delay: c.delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.06, 0.9, 1],
            }}
          />
        ))}

      <motion.g
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: HERO_EASE }}
      >
        <rect
          x={centerX - blockW / 2}
          y={centerY - blockH / 2}
          width={blockW}
          height={blockH}
          rx={8}
          fill={colors.userAccent}
        />
        <text
          x={centerX}
          y={centerY + 5}
          fontSize="14"
          fontFamily="monospace"
          fill={colors.surface}
          textAnchor="middle"
        >
          block
        </text>
      </motion.g>
    </svg>
  );
}

function ParallelSlide({ shouldReduceMotion }: SlideProps) {
  const lanes = [
    { id: "A", retry: false },
    { id: "B", retry: true },
    { id: "C", retry: false },
    { id: "D", retry: false },
  ];

  const laneStartX = 86;
  const laneEndX = 460;
  const laneWidth = laneEndX - laneStartX;
  const laneHeight = 26;
  const laneGap = 30;
  const totalLanesH = lanes.length * (laneHeight + laneGap) - laneGap;
  const lanesStartY = (SLIDE_H - totalLanesH) / 2;
  const commitX = 520;
  const commitW = 56;

  const cycleSec = 3.6;

  return (
    <svg
      role="img"
      aria-label="Four transaction lanes running in parallel, with one lane re-running due to a conflict, then committing in serial order on the right."
      viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`}
      className="w-full h-full"
    >
      <text
        x={(laneStartX + laneEndX) / 2}
        y={lanesStartY - 20}
        fontSize="11"
        fontFamily="monospace"
        fill={colors.textTertiary}
        textAnchor="middle"
      >
        parallel
      </text>
      <text
        x={commitX + commitW / 2}
        y={lanesStartY - 20}
        fontSize="11"
        fontFamily="monospace"
        fill={colors.textTertiary}
        textAnchor="middle"
      >
        serial commit
      </text>

      {lanes.map((lane, i) => {
        const y = lanesStartY + i * (laneHeight + laneGap);
        const cy = y + laneHeight / 2;
        const commitTime = 0.62 + i * 0.06;
        return (
          <g key={lane.id}>
            <text
              x={laneStartX - 12}
              y={cy + 4}
              fontSize="12"
              fontFamily="monospace"
              fill={colors.textPrimary}
              textAnchor="end"
            >
              tx {lane.id}
            </text>

            <rect
              x={laneStartX}
              y={y}
              width={laneWidth}
              height={laneHeight}
              rx={laneHeight / 2}
              fill={colors.borderSoft}
              opacity={0.55}
            />

            {lane.retry ? (
              <>
                <motion.rect
                  x={laneStartX}
                  y={y}
                  height={laneHeight}
                  rx={laneHeight / 2}
                  fill={colors.problemAccentLight}
                  initial={{ width: 0 }}
                  animate={
                    shouldReduceMotion
                      ? { width: 0 }
                      : { width: [0, laneWidth * 0.45, laneWidth * 0.45, 0, 0] }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: cycleSec,
                          times: [0, 0.22, 0.30, 0.34, 1],
                          delay: i * 0.07,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                />
                <motion.rect
                  x={laneStartX}
                  y={y}
                  height={laneHeight}
                  rx={laneHeight / 2}
                  fill={colors.solutionAccent}
                  initial={{ width: 0 }}
                  animate={
                    shouldReduceMotion
                      ? { width: laneWidth }
                      : { width: [0, 0, laneWidth, laneWidth, 0] }
                  }
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          duration: cycleSec,
                          times: [0, 0.38, 0.62, 0.88, 1],
                          delay: i * 0.07,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                  }
                />
              </>
            ) : (
              <motion.rect
                x={laneStartX}
                y={y}
                height={laneHeight}
                rx={laneHeight / 2}
                fill={colors.solutionAccent}
                initial={{ width: 0 }}
                animate={
                  shouldReduceMotion
                    ? { width: laneWidth }
                    : { width: [0, laneWidth, laneWidth, 0] }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: cycleSec,
                        times: [0, 0.55, 0.88, 1],
                        delay: i * 0.07,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              />
            )}

            {lane.retry && !shouldReduceMotion && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                transition={{
                  duration: cycleSec,
                  times: [0, 0.20, 0.24, 0.34, 0.38, 1],
                  delay: i * 0.07,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <rect
                  x={laneStartX + laneWidth * 0.42}
                  y={y - 9}
                  width={62}
                  height={laneHeight + 18}
                  rx={5}
                  fill={colors.problemBg}
                  stroke={colors.problemAccentStrong}
                  strokeWidth="1"
                />
                <text
                  x={laneStartX + laneWidth * 0.42 + 31}
                  y={cy + 4}
                  fontSize="10"
                  fontFamily="monospace"
                  fill={colors.problemAccentStrong}
                  textAnchor="middle"
                >
                  re-run
                </text>
              </motion.g>
            )}

            <line
              x1={laneEndX + 6}
              x2={commitX - 6}
              y1={cy}
              y2={cy}
              stroke={colors.borderSoft}
              strokeWidth="1"
              strokeDasharray="2 4"
            />

            <motion.g
              initial={{ opacity: 0, scale: 0.85 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1, scale: 1 }
                  : {
                      opacity: [0, 0, 1, 1, 0],
                      scale: [0.85, 0.85, 1, 1, 0.85],
                    }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: cycleSec,
                      times: [0, 0.55, commitTime, 0.92, 1],
                      repeat: Infinity,
                      ease: "easeOut",
                    }
              }
            >
              <rect
                x={commitX}
                y={y}
                width={commitW}
                height={laneHeight}
                rx={6}
                fill={colors.solutionBg}
                stroke={colors.solutionAccent}
                strokeWidth="1.2"
              />
              <text
                x={commitX + commitW / 2}
                y={cy + 4}
                fontSize="12"
                fontFamily="monospace"
                fill={colors.solutionAccent}
                textAnchor="middle"
              >
                {lane.id}
              </text>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

function PipelineSlide({ shouldReduceMotion }: SlideProps) {
  const slotW = 96;
  const slotGap = 16;
  const startX = 116;
  const slotX = (i: number) => startX + i * (slotW + slotGap);
  const blockH = 76;
  const consensusY = 70;
  const executionY = 200;

  const consensusBlocks = [
    { col: 0, label: "N−1" },
    { col: 1, label: "N" },
    { col: 2, label: "N+1" },
    { col: 3, label: "N+2" },
  ];
  const executionBlocks = [
    { col: 1, label: "N−1" },
    { col: 2, label: "N" },
    { col: 3, label: "N+1" },
  ];

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: HERO_EASE };

  return (
    <svg
      role="img"
      aria-label="Top consensus track shows blocks N minus 1, N, N plus 1, and N plus 2; bottom execution track shows the same blocks shifted right by one slot, so execution trails consensus by one block."
      viewBox={`0 0 ${SLIDE_W} ${SLIDE_H}`}
      className="w-full h-full"
    >
      <text
        x={28}
        y={consensusY + blockH / 2 + 5}
        fontSize="14"
        fontFamily="monospace"
        fill={colors.userAccent}
      >
        consensus
      </text>
      <text
        x={28}
        y={executionY + blockH / 2 + 5}
        fontSize="14"
        fontFamily="monospace"
        fill={colors.solutionAccent}
      >
        execution
      </text>

      {consensusBlocks.map((b, i) => (
        <motion.g
          key={`c-${b.label}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : i * 0.08 }}
        >
          <rect
            x={slotX(b.col)}
            y={consensusY}
            width={slotW}
            height={blockH}
            rx={10}
            fill={colors.userBg}
            stroke={colors.userAccent}
            strokeWidth="1.5"
          />
          <text
            x={slotX(b.col) + slotW / 2}
            y={consensusY + blockH / 2 + 7}
            fontSize="18"
            fontFamily="monospace"
            textAnchor="middle"
            fill={colors.userAccent}
          >
            {b.label}
          </text>
        </motion.g>
      ))}

      {executionBlocks.map((b, i) => (
        <motion.g
          key={`e-${b.label}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: shouldReduceMotion ? 0 : i * 0.08 + 0.25 }}
        >
          <rect
            x={slotX(b.col)}
            y={executionY}
            width={slotW}
            height={blockH}
            rx={10}
            fill={colors.solutionBg}
            stroke={colors.solutionAccent}
            strokeWidth="1.5"
          />
          <text
            x={slotX(b.col) + slotW / 2}
            y={executionY + blockH / 2 + 7}
            fontSize="18"
            fontFamily="monospace"
            textAnchor="middle"
            fill={colors.solutionAccent}
          >
            {b.label}
          </text>
        </motion.g>
      ))}

      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.7 }}
      >
        <line
          x1={slotX(2) + slotW / 2}
          x2={slotX(2) + slotW / 2}
          y1={consensusY + blockH + 4}
          y2={executionY - 4}
          stroke={colors.textTertiary}
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <text
          x={slotX(2) + slotW / 2 + 10}
          y={(consensusY + blockH + executionY) / 2 + 4}
          fontSize="11"
          fontFamily="monospace"
          fill={colors.textTertiary}
        >
          + 1 block
        </text>
      </motion.g>

      <line
        x1={startX - 12}
        x2={slotX(3) + slotW + 12}
        y1={SLIDE_H - 32}
        y2={SLIDE_H - 32}
        stroke={colors.borderSoft}
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      <text
        x={slotX(3) + slotW + 12}
        y={SLIDE_H - 14}
        fontSize="10"
        fontFamily="monospace"
        fill={colors.textTertiary}
        textAnchor="end"
      >
        time →
      </text>
    </svg>
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
