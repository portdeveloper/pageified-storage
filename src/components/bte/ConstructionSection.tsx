"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/lib/colors";
import { useInView } from "../useInView";
import { usePrefersReducedMotion } from "./useReducedMotion";

const COMMITTEE_N = 5;
const BATCH = 5;

export default function ConstructionSection() {
  const { ref, isVisible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="py-24 px-6 bg-surface-elevated border-y border-border"
    >
      <div
        className={`max-w-[1120px] mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.015em]">
          The construction, at a glance
        </h2>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-8">
          BTX builds on pairing-friendly elliptic curves (BLS12-381).
          Everything below is a sketch — the paper has the full protocol,
          proofs, and security reductions.
        </p>

        {/* 1. Encryption */}
        <CiphertextFormula />

        {/* 2. Committee */}
        <div className="mb-10">
          <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold text-solution-accent">
            2. Committee decryption
          </p>
          <h3 className="my-1.5 text-[1.15rem] font-semibold">
            One G₁ element per server, regardless of batch size
          </h3>
          <p className="text-[14px] text-text-secondary leading-[1.6] max-w-[46rem] mb-6">
            Powers of the secret key τ are Shamir-shared across N servers.
            Any t+1 collectively decrypt. Each server sends exactly{" "}
            <strong>one group element</strong> to the combiner — its message
            size is independent of batch size.
          </p>
          <CommitteeAnimation />
        </div>

        {/* 3. FFT trick */}
        <div
          className="rounded-2xl border p-[22px]"
          style={{
            background: colors.solutionBg,
            borderColor:
              "color-mix(in oklab, " +
              colors.solutionAccent +
              " 22%, transparent)",
          }}
        >
          <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold text-solution-accent">
            3. The speed trick
          </p>
          <h3 className="my-1.5 text-[1.15rem] font-semibold">
            Batch decryption as a polynomial product
          </h3>
          <p className="text-[14px] text-text-secondary leading-[1.6] mb-3.5 max-w-[46rem]">
            Naïve batch decryption costs{" "}
            <span className="font-mono">O(B²)</span> pairings — every
            ciphertext contributes a cross-term to every other. BTX observes
            these cross-terms form a{" "}
            <em>contiguous window of a polynomial product</em>, computable as
            a middle-product via FFT:{" "}
            <span className="font-mono">O(B log B)</span> group operations,{" "}
            <span className="font-mono">O(B)</span> pairings.
          </p>
          <FftComparison />
        </div>
      </div>
    </section>
  );
}

/* ---------- 1. Ciphertext formula ---------- */
function CiphertextFormula() {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid grid-cols-1 md:[grid-template-columns:minmax(0,0.85fr)_minmax(0,1.15fr)] gap-7 mb-10 items-center">
      <div>
        <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold text-solution-accent">
          1. Encryption
        </p>
        <h3 className="my-1.5 text-[1.15rem] font-semibold">
          An ElGamal-shaped ciphertext
        </h3>
        <p className="text-[14px] text-text-secondary leading-[1.6]">
          To encrypt m, pick random r. Output a pair: the randomness, and m
          masked by a pad derived from the encryption key. That&apos;s it.
        </p>
      </div>
      <div
        ref={ref}
        className="bg-surface border border-border rounded-2xl p-[22px]"
        style={{ fontFamily: "var(--font-plex-mono), ui-monospace, monospace" }}
      >
        <p className="text-[10px] text-text-tertiary tracking-[0.08em] uppercase mb-3.5">
          Ciphertext
        </p>
        <div className="flex items-center gap-2.5 flex-wrap text-[14px]">
          <span style={{ color: colors.textSecondary }}>ct =</span>
          <span
            className="font-semibold px-3 py-2 rounded-lg"
            style={{
              background: colors.userAccentLight,
              color: colors.userAccent,
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.5s, transform 0.5s",
            }}
          >
            [r]₁
          </span>
          <span style={{ color: colors.textTertiary }}>,</span>
          <span
            className="font-semibold px-3 py-2 rounded-lg"
            style={{
              background: colors.solutionAccentLight,
              color: colors.solutionAccent,
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 0.5s 0.25s, transform 0.5s 0.25s",
            }}
          >
            m + r · ek
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-[18px] pt-4 border-t border-border">
          <div>
            <p
              className="text-[11px] font-semibold mb-0.5"
              style={{ color: colors.userAccent }}
            >
              [r]₁
            </p>
            <p className="text-[10.5px] text-text-tertiary leading-[1.45]">
              randomness in G₁
            </p>
          </div>
          <div>
            <p
              className="text-[11px] font-semibold mb-0.5"
              style={{ color: colors.solutionAccent }}
            >
              m + r · ek
            </p>
            <p className="text-[10.5px] text-text-tertiary leading-[1.45]">
              masked message in G_T
            </p>
          </div>
        </div>
        <p className="text-[10.5px] text-text-tertiary mt-3.5 leading-[1.5]">
          Core size: |G₁| + |G_T|. A short Schnorr NIZK rides alongside for
          CCA security.
        </p>
      </div>
    </div>
  );
}

/* ---------- 2. Committee SVG animation ---------- */
interface FlyingDot {
  id: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  start: number;
  duration: number;
}

function CommitteeAnimation() {
  const reduced = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [ctVisible, setCtVisible] = useState<boolean[]>(() =>
    reduced ? new Array(BATCH).fill(true) : new Array(BATCH).fill(false),
  );
  const [serverOn, setServerOn] = useState<boolean[]>(() =>
    reduced
      ? new Array(COMMITTEE_N).fill(true)
      : new Array(COMMITTEE_N).fill(false),
  );
  const [ptVisible, setPtVisible] = useState<boolean[]>(() =>
    reduced ? new Array(BATCH).fill(true) : new Array(BATCH).fill(false),
  );
  const [dots, setDots] = useState<FlyingDot[]>([]);
  const playingRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const nextDotId = useRef(0);

  const cx = 320;
  const cy = 140;
  const rad = 60;

  const cts = useMemo(
    () =>
      Array.from({ length: BATCH }).map((_, i) => ({
        y: 50 + i * 38,
        x: 140,
      })),
    [],
  );
  const pts = useMemo(
    () =>
      Array.from({ length: BATCH }).map((_, i) => ({
        y: 50 + i * 38,
        x: 500,
      })),
    [],
  );
  const servers = useMemo(
    () =>
      Array.from({ length: COMMITTEE_N }).map((_, i) => {
        const angle = (i / COMMITTEE_N) * Math.PI * 2 - Math.PI / 2;
        return {
          sx: cx + Math.cos(angle) * rad,
          sy: cy + Math.sin(angle) * rad,
        };
      }),
    [],
  );

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const addDot = useCallback(
    (x0: number, y0: number, x1: number, y1: number, duration: number) => {
      const id = nextDotId.current++;
      setDots((prev) => [
        ...prev,
        { id, x0, y0, x1, y1, start: performance.now(), duration },
      ]);
      const t = setTimeout(
        () => setDots((prev) => prev.filter((d) => d.id !== id)),
        duration + 60,
      );
      timersRef.current.push(t);
    },
    [],
  );

  const resetState = useCallback(() => {
    setCtVisible(new Array(BATCH).fill(false));
    setServerOn(new Array(COMMITTEE_N).fill(false));
    setPtVisible(new Array(BATCH).fill(false));
    setDots([]);
  }, []);

  const play = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    clearTimers();
    resetState();

    const speed = 1;
    const schedule = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms / speed);
      timersRef.current.push(t);
    };

    // ciphertexts fade in
    let t0 = 0;
    for (let i = 0; i < BATCH; i++) {
      const idx = i;
      schedule(t0, () => {
        setCtVisible((arr) => {
          const next = arr.slice();
          next[idx] = true;
          return next;
        });
      });
      t0 += 80;
    }
    t0 += 200;

    // ciphertexts arrow toward center
    schedule(t0, () => {
      cts.forEach((c) => {
        addDot(c.x, c.y, cx, cy, 500);
      });
    });
    t0 += 600;

    // servers light up + emit dots to combiner
    for (let i = 0; i < COMMITTEE_N; i++) {
      const idx = i;
      const s = servers[i];
      schedule(t0, () => {
        setServerOn((arr) => {
          const next = arr.slice();
          next[idx] = true;
          return next;
        });
        addDot(s.sx, s.sy, cx, cy, 400);
      });
      t0 += 120;
    }
    t0 += 300;

    // plaintexts appear
    for (let i = 0; i < BATCH; i++) {
      const idx = i;
      const p = pts[i];
      schedule(t0, () => {
        addDot(cx, cy, p.x, p.y, 400);
        const t = setTimeout(() => {
          setPtVisible((arr) => {
            const next = arr.slice();
            next[idx] = true;
            return next;
          });
        }, 400);
        timersRef.current.push(t);
      });
      t0 += 100;
    }
    t0 += 1200;

    const done = setTimeout(() => {
      playingRef.current = false;
    }, t0);
    timersRef.current.push(done);
  }, [addDot, cts, pts, resetState, servers]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    if (reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimers();
    };
  }, [play, reduced]);

  return (
    <div className="bg-surface border border-border rounded-2xl p-[22px]">
      <svg
        ref={svgRef}
        viewBox="0 0 640 280"
        className="w-full block"
        aria-hidden="true"
      >
        {(["CIPHERTEXTS", "COMMITTEE", "PLAINTEXTS"] as const).map((l, i) => (
          <text
            key={l}
            x={[90, 320, 550][i]}
            y={18}
            textAnchor="middle"
            fontFamily="var(--font-plex-mono), ui-monospace, monospace"
            fontSize={9}
            fill={colors.textTertiary}
            letterSpacing={0.8}
          >
            {l}
          </text>
        ))}

        {/* ciphertexts */}
        {cts.map((c, i) => (
          <g
            key={i}
            opacity={ctVisible[i] ? 1 : 0}
            style={{ transition: "opacity 0.4s" }}
          >
            <rect
              x={40}
              y={c.y - 12}
              width={100}
              height={24}
              rx={4}
              fill={colors.surfaceElevated}
              stroke={colors.border}
            />
            <text
              x={60}
              y={c.y + 3}
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={11}
              fill={colors.solutionAccent}
              fontWeight={600}
            >
              ct
            </text>
            <text
              x={78}
              y={c.y + 3}
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={10}
              fill={colors.textTertiary}
            >
              #{i + 1}
            </text>
          </g>
        ))}

        {/* committee ring */}
        <circle
          cx={cx}
          cy={cy}
          r={rad + 10}
          fill="none"
          stroke={colors.border}
          strokeDasharray="3 3"
        />
        <text
          x={cx}
          y={cy - rad - 18}
          textAnchor="middle"
          fontFamily="var(--font-plex-mono), ui-monospace, monospace"
          fontSize={9}
          fill={colors.textTertiary}
        >
          t+1 of N
        </text>
        <text
          x={cx}
          y={cy + rad + 24}
          textAnchor="middle"
          fontFamily="var(--font-plex-mono), ui-monospace, monospace"
          fontSize={9}
          fill={colors.textTertiary}
        >
          combiner · 1 G₁ per server
        </text>
        {servers.map((s, i) => (
          <g key={i}>
            <circle
              cx={s.sx}
              cy={s.sy}
              r={9}
              fill={serverOn[i] ? colors.solutionAccent : colors.solutionAccentLight}
              stroke={colors.solutionAccent}
              strokeWidth={1.2}
              style={{ transition: "fill 0.3s" }}
            />
            <text
              x={s.sx}
              y={s.sy + 3}
              textAnchor="middle"
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={8}
              fill={serverOn[i] ? "white" : colors.solutionAccent}
              fontWeight={600}
            >
              σ{i + 1}
            </text>
          </g>
        ))}

        {/* plaintexts */}
        {pts.map((p, i) => (
          <g
            key={i}
            opacity={ptVisible[i] ? 1 : 0}
            style={{ transition: "opacity 0.4s" }}
          >
            <rect
              x={500}
              y={p.y - 12}
              width={100}
              height={24}
              rx={4}
              fill={colors.solutionAccentLight}
              stroke={colors.solutionAccent}
              strokeWidth={0.8}
            />
            <text
              x={515}
              y={p.y + 3}
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={11}
              fill={colors.solutionAccent}
              fontWeight={600}
            >
              m
            </text>
            <text
              x={527}
              y={p.y + 6}
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={9}
              fill={colors.solutionAccent}
            >
              {i + 1}
            </text>
          </g>
        ))}

        {/* flying dots */}
        {dots.map((d) => (
          <FlyingDotEl key={d.id} dot={d} />
        ))}
      </svg>
      <div className="flex justify-center mt-2">
        <button
          type="button"
          onClick={play}
          className="bg-transparent border border-border rounded-full font-mono text-[11px] px-3.5 py-1.5 text-text-secondary hover:border-text-tertiary transition-colors"
        >
          ↻ replay
        </button>
      </div>
    </div>
  );
}

function FlyingDotEl({ dot }: { dot: FlyingDot }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const step = (now: number) => {
      const progress = Math.min(1, (now - dot.start) / dot.duration);
      setT(progress);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [dot.start, dot.duration]);
  const eased = 1 - Math.pow(1 - t, 3);
  const cx = dot.x0 + (dot.x1 - dot.x0) * eased;
  const cy = dot.y0 + (dot.y1 - dot.y0) * eased;
  return (
    <circle cx={cx} cy={cy} r={3} fill={colors.solutionAccent} opacity={1 - eased} />
  );
}

/* ---------- 3. FFT grid comparison ---------- */
function FftComparison() {
  return (
    <div className="mt-5 grid [grid-template-columns:1fr_auto_1fr] gap-[18px] items-center">
      <div>
        <p
          className="font-mono text-[10.5px] font-semibold mb-2 text-center"
          style={{ color: colors.problemAccentStrong }}
        >
          Naïve: O(B²)
        </p>
        <div
          className="grid grid-cols-8 gap-[2px] max-w-[160px] mx-auto"
          style={{ aspectRatio: "1 / 1" }}
        >
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: colors.problemAccent,
                aspectRatio: "1 / 1",
                borderRadius: 1,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      </div>
      <div
        className="font-mono text-[22px]"
        style={{ color: colors.textTertiary }}
      >
        →
      </div>
      <div>
        <p className="font-mono text-[10.5px] font-semibold mb-2 text-center text-solution-accent">
          BTX FFT: O(B log B)
        </p>
        <div
          className="grid grid-cols-8 gap-[2px] max-w-[160px] mx-auto"
          style={{ aspectRatio: "1 / 1" }}
        >
          {Array.from({ length: 64 }).map((_, i) => {
            const onDiag = i % 9 === 0 || Math.log2(i + 1) % 1 === 0;
            return (
              <div
                key={i}
                style={{
                  background: onDiag
                    ? colors.solutionAccent
                    : colors.solutionAccentLight,
                  aspectRatio: "1 / 1",
                  borderRadius: 1,
                  opacity: onDiag ? 0.95 : 0.25,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
