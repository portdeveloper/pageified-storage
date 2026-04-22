"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/colors";
import { PAPER_URL } from "./shared";

const MP_COLS = 6;
const MP_ROWS = 8;
const CELL = 22;
const GAP = 2;
const TOTAL_CELLS = MP_COLS * MP_ROWS;
const COMMITTEE_N = 5;

type Phase = "encrypt" | "select" | "decrypt" | "done";

const PHASE_META: Record<Phase, { label: string; color: string }> = {
  encrypt: { label: "users encrypt", color: colors.userAccent },
  select: { label: "builder picks batch", color: colors.problemAccentStrong },
  decrypt: { label: "committee opens", color: colors.solutionAccent },
  done: { label: "block executes", color: colors.solutionAccent },
};

function pickBatch(): Set<number> {
  const target = Math.floor(TOTAL_CELLS * 0.4);
  const s = new Set<number>();
  while (s.size < target) s.add(Math.floor(Math.random() * TOTAL_CELLS));
  return s;
}

interface Particle {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  duration: number;
  start: number;
}

export default function BteHeroSection() {
  const [phase, setPhase] = useState<Phase>("encrypt");
  const [cellStates, setCellStates] = useState<number[]>(
    () => new Array(TOTAL_CELLS).fill(0),
  );
  const [serverOn, setServerOn] = useState<boolean[]>(() =>
    new Array(COMMITTEE_N).fill(false),
  );
  const [blockSlots, setBlockSlots] = useState<number>(0);
  const [revealed, setRevealed] = useState(0);
  const [kept, setKept] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<Set<number>>(
    () => new Set(),
  );
  const [particles, setParticles] = useState<Particle[]>([]);
  const nextParticleId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(() => resolve(), ms);
        timers.push(t);
      });

    const emit = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      color: string,
      duration = 500,
    ) => {
      const id = nextParticleId.current++;
      const p: Particle = {
        id,
        x0,
        y0,
        x1,
        y1,
        color,
        duration,
        start: performance.now(),
      };
      setParticles((ps) => [...ps, p]);
      const cleanup = setTimeout(() => {
        setParticles((ps) => ps.filter((q) => q.id !== id));
      }, duration + 50);
      timers.push(cleanup);
    };

    async function cycle() {
      if (cancelled) return;
      // reset
      setCellStates(new Array(TOTAL_CELLS).fill(0));
      setServerOn(new Array(COMMITTEE_N).fill(false));
      setBlockSlots(0);
      setRevealed(0);
      setKept(0);
      setParticles([]);
      const batch = pickBatch();
      setSelectedBatch(batch);

      // phase 1: users emit → mempool fills (state 1 = filled)
      setPhase("encrypt");
      for (let i = 0; i < TOTAL_CELLS; i++) {
        if (cancelled) return;
        const user = i % 3;
        const userX = 40;
        const userY = 60 + user * 80;
        const col = i % MP_COLS;
        const row = Math.floor(i / MP_COLS);
        const cellX = 150 + col * (CELL + GAP) + CELL / 2;
        const cellY = 70 + row * (CELL + GAP) + CELL / 2;
        emit(userX, userY, cellX, cellY, colors.userAccent, 500);
        const idx = i;
        const markTimer = setTimeout(() => {
          if (cancelled) return;
          setCellStates((arr) => {
            const next = arr.slice();
            next[idx] = 1;
            return next;
          });
        }, 500);
        timers.push(markTimer);
        if (i % 4 === 0) await delay(40);
      }
      await delay(800);

      // phase 2: builder selects
      if (cancelled) return;
      setPhase("select");
      const selArr = [...batch];
      selArr.forEach((idx, j) => {
        const t = setTimeout(() => {
          if (cancelled) return;
          setCellStates((arr) => {
            const next = arr.slice();
            next[idx] = 2;
            return next;
          });
        }, (j % 8) * 20);
        timers.push(t);
      });
      await delay(1100);

      // phase 3: committee lights up + emits shares
      if (cancelled) return;
      setPhase("decrypt");
      for (let i = 0; i < COMMITTEE_N; i++) {
        const t = setTimeout(() => {
          if (cancelled) return;
          setServerOn((arr) => {
            const next = arr.slice();
            next[i] = true;
            return next;
          });
          const angle = (i / COMMITTEE_N) * Math.PI * 2 - Math.PI / 2;
          const sx = 380 + Math.cos(angle) * 40;
          const sy = 170 + Math.sin(angle) * 40;
          emit(sx, sy, 380, 170, colors.solutionAccent, 400);
        }, i * 80);
        timers.push(t);
      }
      await delay(700);

      // decrypt each selected ct
      let rev = 0;
      for (const idx of selArr) {
        if (cancelled) return;
        const col = idx % MP_COLS;
        const row = Math.floor(idx / MP_COLS);
        const cellX = 150 + col * (CELL + GAP) + CELL / 2;
        const cellY = 70 + row * (CELL + GAP) + CELL / 2;
        emit(380, 170, cellX, cellY, colors.solutionAccent, 300);
        const thisIdx = idx;
        const t = setTimeout(() => {
          if (cancelled) return;
          setCellStates((arr) => {
            const next = arr.slice();
            next[thisIdx] = 3;
            return next;
          });
          rev += 1;
          setRevealed(rev);
          setKept(TOTAL_CELLS - rev);
        }, 300);
        timers.push(t);
        await delay(30);
      }
      await delay(400);

      // phase 4: block fills
      if (cancelled) return;
      setPhase("done");
      const rows = Math.min(selArr.length, 10);
      for (let i = 0; i < rows; i++) {
        const idx = selArr[i];
        const col = idx % MP_COLS;
        const row = Math.floor(idx / MP_COLS);
        const cellX = 150 + col * (CELL + GAP) + CELL / 2;
        const cellY = 70 + row * (CELL + GAP) + CELL / 2;
        const slotY = 102 + i * 16;
        emit(cellX, cellY, 520, slotY, colors.solutionAccent, 400);
        const slotIndex = i + 1;
        const t = setTimeout(() => {
          if (cancelled) return;
          setBlockSlots(slotIndex);
        }, 400 + i * 50);
        timers.push(t);
      }
      await delay(2200);

      if (!cancelled) {
        await delay(800);
        cycle();
      }
    }

    cycle();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  const phaseMeta = PHASE_META[phase];

  return (
    <section
      id="hero-root"
      className="min-h-[92vh] flex items-center px-6 pt-20"
    >
      <RevealBlock className="max-w-[1120px] mx-auto w-full">
        <div className="grid grid-cols-1 md:[grid-template-columns:minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 md:gap-16 items-center py-10 md:py-16">
          <div>
            <h1 className="mb-5 leading-[1.05] tracking-[-0.02em] text-[clamp(2.5rem,4.5vw,3.5rem)]">
              <span className="block font-light text-text-secondary mb-1.5">
                BTX
              </span>
              <span className="block font-semibold text-solution-accent">
                Batched Threshold Encryption
              </span>
            </h1>
            <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-5">
              A committee of servers decrypts any chosen subset of ciphertexts
              while the rest stay private — the key primitive for encrypted
              mempools that stop MEV.
            </p>
            <p className="font-mono text-[13px] text-solution-accent leading-[1.6] mb-7">
              Shortest ciphertext. Collision-free. Epochless.
              <br />
              Fast enough for tight latency budgets.
            </p>
            <div className="flex gap-3.5 items-center flex-wrap">
              <a
                href={PAPER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-text-primary text-surface font-mono text-xs font-medium px-[18px] py-3 rounded-[10px] hover:bg-[#332b22] transition-colors min-h-11"
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
                href="#problem-root"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors min-h-11 px-2"
              >
                Or read the explainer <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div
            className="bg-surface-elevated border border-border rounded-2xl p-[22px]"
            style={{ boxShadow: "0 30px 60px -40px rgba(26,23,20,0.18)" }}
          >
            <div className="flex justify-end items-center mb-3.5">
              <span
                key={phase}
                className="font-mono text-[10px] font-semibold px-2.5 py-[3px] rounded-full transition-all duration-300"
                style={{
                  color: phaseMeta.color,
                  backgroundColor: phaseMeta.color + "18",
                }}
              >
                {phaseMeta.label}
              </span>
            </div>

            <svg
              viewBox="0 0 590 340"
              className="w-full h-auto block"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="hero-flow-grad" x1="0" x2="1">
                  <stop offset="0" stopColor={colors.solutionAccent} stopOpacity="0" />
                  <stop offset="0.5" stopColor={colors.solutionAccent} stopOpacity="0.6" />
                  <stop offset="1" stopColor={colors.solutionAccent} stopOpacity="0" />
                </linearGradient>
              </defs>

              <g
                fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                fontSize={9}
                fill={colors.textTertiary}
                letterSpacing={1.2}
              >
                <text x={40} y={18} textAnchor="middle">USERS</text>
                <text x={220} y={18} textAnchor="middle">MEMPOOL</text>
                <text x={380} y={18} textAnchor="middle">COMMITTEE</text>
                <text x={520} y={18} textAnchor="middle">BLOCK</text>
              </g>

              {/* User pool */}
              <g>
                {[60, 140, 220].map((y, i) => (
                  <g key={i} transform={`translate(40 ${y})`}>
                    <circle
                      r={9}
                      fill={colors.userBg}
                      stroke={colors.userAccent}
                      strokeWidth={1.2}
                    />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                      fontSize={9}
                      fill={colors.userAccent}
                      fontWeight={600}
                    >
                      {["A", "B", "C"][i]}
                    </text>
                  </g>
                ))}
              </g>

              {/* Mempool */}
              <g>
                <rect
                  x={140}
                  y={40}
                  width={160}
                  height={260}
                  rx={10}
                  fill={colors.surface}
                  stroke={colors.border}
                />
                <text
                  x={220}
                  y={58}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                  fontSize={9}
                  fill={colors.textTertiary}
                  letterSpacing={0.8}
                >
                  ciphertexts
                </text>
                {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
                  const col = i % MP_COLS;
                  const row = Math.floor(i / MP_COLS);
                  const x = 150 + col * (CELL + GAP);
                  const y = 70 + row * (CELL + GAP);
                  const state = cellStates[i];
                  const fill =
                    state === 0
                      ? colors.border
                      : state === 1
                        ? "#d6cfc5"
                        : state === 2
                          ? colors.problemAccentLight
                          : colors.solutionAccentLight;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={y}
                      width={CELL}
                      height={CELL}
                      rx={3}
                      fill={fill}
                      style={{ transition: "fill 0.35s" }}
                    />
                  );
                })}
                <g
                  style={{
                    opacity: phase === "select" || phase === "decrypt" || phase === "done" ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                >
                  <rect x={145} y={66} width={150} height={3} fill={colors.problemAccent} />
                  <text
                    x={220}
                    y={80}
                    textAnchor="middle"
                    fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                    fontSize={9}
                    fontWeight={600}
                    fill={colors.problemAccentStrong}
                  >
                    builder picks batch
                  </text>
                </g>
              </g>

              <line
                x1={300}
                y1={170}
                x2={340}
                y2={170}
                stroke={colors.border}
                strokeWidth={1.5}
              />
              <polygon points="340,170 334,166 334,174" fill={colors.border} />

              {/* Committee */}
              <g transform="translate(380 170)">
                <circle
                  r={55}
                  fill={colors.surfaceElevated}
                  stroke={colors.border}
                  strokeDasharray="3 3"
                />
                <text
                  x={0}
                  y={-65}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                  fontSize={9}
                  fill={colors.textTertiary}
                >
                  threshold t+1 of N
                </text>
                {Array.from({ length: COMMITTEE_N }).map((_, i) => {
                  const angle = (i / COMMITTEE_N) * Math.PI * 2 - Math.PI / 2;
                  const cx = Math.cos(angle) * 40;
                  const cy = Math.sin(angle) * 40;
                  const on = serverOn[i];
                  return (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r={on ? 6 : 5}
                      fill={on ? colors.solutionAccent : colors.solutionAccentLight}
                      stroke={colors.solutionAccent}
                      strokeWidth={1.2}
                      style={{ transition: "fill 0.3s, r 0.3s" }}
                    />
                  );
                })}
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                  fontSize={13}
                  fontWeight={600}
                  fill={colors.solutionAccent}
                >
                  {COMMITTEE_N}
                </text>
                <text
                  x={0}
                  y={18}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                  fontSize={8}
                  fill={colors.textTertiary}
                >
                  servers
                </text>
              </g>

              <line
                x1={440}
                y1={170}
                x2={480}
                y2={170}
                stroke={colors.border}
                strokeWidth={1.5}
              />
              <polygon points="480,170 474,166 474,174" fill={colors.border} />

              {/* Block */}
              <g>
                <rect
                  x={480}
                  y={70}
                  width={80}
                  height={200}
                  rx={10}
                  fill={colors.solutionBg}
                  stroke={colors.solutionAccentLight}
                />
                <text
                  x={520}
                  y={88}
                  textAnchor="middle"
                  fontFamily="var(--font-plex-mono), ui-monospace, monospace"
                  fontSize={9}
                  fontWeight={600}
                  fill={colors.solutionAccent}
                >
                  BLOCK N
                </text>
                {Array.from({ length: Math.min(selectedBatch.size, 10) }).map(
                  (_, i) => (
                    <rect
                      key={i}
                      x={490}
                      y={96 + i * 16}
                      width={60}
                      height={12}
                      rx={2}
                      fill={colors.solutionAccentLight}
                      opacity={i < blockSlots ? 1 : 0}
                      style={{ transition: "opacity 0.4s" }}
                    />
                  ),
                )}
              </g>

              {/* Particles */}
              <g>
                {particles.map((p) => (
                  <ParticleDot key={p.id} {...p} />
                ))}
              </g>
            </svg>

            <div className="flex justify-between mt-3.5 font-mono text-[10px] text-text-tertiary flex-wrap gap-y-2">
              <div>
                <span
                  className="text-solution-accent font-semibold"
                  style={{ color: colors.solutionAccent }}
                >
                  {revealed}
                </span>{" "}
                revealed
                <span className="mx-1.5">·</span>
                <span>{kept}</span> stay private
              </div>
              <div className="flex gap-3.5 flex-wrap">
                <LegendDot color={colors.border} label="encrypted" />
                <LegendDot color={colors.problemAccentLight} label="selected" />
                <LegendDot color={colors.solutionAccentLight} label="decrypted" />
              </div>
            </div>
          </div>
        </div>
      </RevealBlock>
    </section>
  );
}

function ParticleDot({ x0, y0, x1, y1, color, duration, start }: Particle) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setT(eased);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, duration]);

  const cx = x0 + (x1 - x0) * t;
  const cy = y0 + (y1 - y0) * t;
  return (
    <circle cx={cx} cy={cy} r={2.5} fill={color} opacity={0.9 * (1 - t)} />
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block w-2 h-2 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function RevealBlock({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`section-reveal ${shown ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
