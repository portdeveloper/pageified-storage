"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/lib/colors";
import { useInView } from "../useInView";
import { BENCHMARKS } from "./shared";

const W = 640;
const H = 280;
const PAD_L = 56;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 44;
const CW = W - PAD_L - PAD_R;
const CH = H - PAD_T - PAD_B;
const B_MIN = BENCHMARKS[0].b;
const B_MAX = BENCHMARKS[BENCHMARKS.length - 1].b;
const Y_MAX = 1.8;

function xOf(b: number) {
  return PAD_L + (Math.log2(b / B_MIN) / Math.log2(B_MAX / B_MIN)) * CW;
}
function yOf(v: number) {
  return PAD_T + CH - (v / Y_MAX) * CH;
}

export default function BenchmarksSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface">
      <div
        className={`max-w-[1120px] mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.015em]">
          Faster than the best prior schemes
        </h2>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-8">
          The authors reimplemented PFE and BEAT++ in the same
          aggressively-optimized C++ codebase as BTX — AVX-512, FFT backends,
          optimized MSM and pairing paths. A comparison against tuned
          baselines, not reference code.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <HeadlineCard
            headline="2.0×"
            headlineSuffix="faster total decryption at B=512"
            bars={[
              { label: "PFE", value: "1197 ms", width: 100 },
              { label: "BTX", value: "598 ms", width: 50, highlight: true },
            ]}
          />
          <HeadlineCard
            headline="4.2×"
            headlineSuffix="faster per ciphertext · 1 pairing vs 4"
            bars={[
              { label: "PFE", value: "0.723 ms/ct", width: 100 },
              {
                label: "BTX",
                value: "0.171 ms/ct",
                width: 24,
                highlight: true,
              },
            ]}
          />
        </div>

        <div className="bg-surface-elevated border border-border rounded-2xl p-[22px]">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2.5">
            <p className="text-[14px] text-text-secondary m-0">
              Decryption time vs batch size. Drag across the chart to
              inspect.
            </p>
            <div className="flex gap-3.5 font-mono text-[11px] flex-wrap">
              <LegendSwatch
                color={colors.problemAccent}
                label="PFE precompute"
              />
              <LegendSwatch
                color={colors.solutionAccent}
                label="BTX precompute"
              />
              <LegendSwatch
                color={colors.textTertiary}
                label="BEAT++ precompute"
                dashed
              />
            </div>
          </div>

          <BenchmarkChart />

          <p className="font-mono text-[10.5px] text-text-tertiary mt-4 leading-[1.6]">
            BEAT++ traces BTX within fractions of a millisecond — same
            internal algebra, but BEAT++ is collision-prone. The censorship
            resistance is free.
            <br />
            Intel Xeon Platinum 8488C (3.8 GHz),{" "}
            <span className="font-mono">blst</span> over BLS12-381 with
            AVX-512, Clang 21.1.8. Per-ciphertext from BTX Table 4; totals
            from the abstract.
          </p>
        </div>
      </div>
    </section>
  );
}

function LegendSwatch({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block w-[14px] h-[2px]"
        style={
          dashed
            ? {
                backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`,
                backgroundSize: "5px 2px",
                backgroundRepeat: "repeat-x",
              }
            : { background: color }
        }
      />
      {label}
    </span>
  );
}

function HeadlineCard({
  headline,
  headlineSuffix,
  bars,
}: {
  headline: string;
  headlineSuffix: string;
  bars: { label: string; value: string; width: number; highlight?: boolean }[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const el = cardRef.current;
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
    <div
      ref={cardRef}
      className="border border-border rounded-2xl p-6"
      style={{
        background: `linear-gradient(135deg, ${colors.solutionBg}, ${colors.surfaceElevated})`,
      }}
    >
      <div className="flex items-baseline gap-2.5 mb-3">
        <span
          className="text-[44px] font-semibold text-solution-accent"
          style={{ letterSpacing: "-0.03em" }}
        >
          {headline}
        </span>
        <span className="text-[13px] text-text-secondary">
          {headlineSuffix}
        </span>
      </div>
      <div className="mt-4">
        {bars.map((b, i) => (
          <div key={b.label} style={{ marginTop: i === 0 ? 0 : 10 }}>
            <div className="flex justify-between font-mono text-[10.5px] mb-1">
              <span
                className={b.highlight ? "font-semibold" : ""}
                style={{
                  color: b.highlight
                    ? colors.solutionAccent
                    : colors.problemAccentStrong,
                }}
              >
                {b.label}
              </span>
              <span>{b.value}</span>
            </div>
            <div
              className="h-2 rounded-sm overflow-hidden"
              style={{ background: colors.border }}
            >
              <div
                style={{
                  height: "100%",
                  width: revealed ? b.width + "%" : 0,
                  background: b.highlight
                    ? colors.solutionAccent
                    : colors.problemAccent,
                  transition: `width 0.9s cubic-bezier(0.16,1,0.3,1) ${
                    b.highlight ? 0.2 : 0
                  }s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenchmarkChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const hitRef = useRef<SVGRectElement>(null);
  const pfePathRef = useRef<SVGPathElement>(null);
  const btxPathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState<number>(BENCHMARKS.length - 1);
  const [hover, setHover] = useState<number | null>(null);

  const fillPath = useMemo(() => {
    const forward = BENCHMARKS.map(
      (r, i) => `${i === 0 ? "M" : "L"}${xOf(r.b)},${yOf(r.pfePre)}`,
    ).join(" ");
    const back = [...BENCHMARKS]
      .reverse()
      .map((r) => `L${xOf(r.b)},${yOf(r.btxPre)}`)
      .join(" ");
    return `${forward} ${back} Z`;
  }, []);

  const pfePath = useMemo(
    () =>
      BENCHMARKS.map(
        (r, i) => `${i === 0 ? "M" : "L"}${xOf(r.b)},${yOf(r.pfePre)}`,
      ).join(" "),
    [],
  );
  const btxPath = useMemo(
    () =>
      BENCHMARKS.map(
        (r, i) => `${i === 0 ? "M" : "L"}${xOf(r.b)},${yOf(r.btxPre)}`,
      ).join(" "),
    [],
  );
  const beatPath = useMemo(
    () =>
      BENCHMARKS.map(
        (r, i) => `${i === 0 ? "M" : "L"}${xOf(r.b)},${yOf(r.beatPre)}`,
      ).join(" "),
    [],
  );

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          [pfePathRef.current, btxPathRef.current].forEach((p) => {
            if (!p) return;
            const len = p.getTotalLength();
            p.style.strokeDasharray = String(len);
            p.style.strokeDashoffset = reduce ? "0" : String(len);
            if (!reduce) {
              p.animate(
                [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
                {
                  duration: 1200,
                  easing: "cubic-bezier(.3,0,.2,1)",
                  fill: "forwards",
                },
              );
            }
          });
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const handleMove = (ev: React.MouseEvent<SVGRectElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = (ev.clientX - rect.left) * (W / rect.width);
    let best = 0;
    let bd = Infinity;
    BENCHMARKS.forEach((r, i) => {
      const d = Math.abs(xOf(r.b) - px);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    setHover(best);
    setActive(best);
  };

  const row = BENCHMARKS[active];
  const speedup = (row.pfePre / row.btxPre).toFixed(2);
  const hoverX = hover !== null ? xOf(BENCHMARKS[hover].b) : -1;

  return (
    <>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full block"
        aria-label="How decryption scales with batch size"
      >
        {/* grid */}
        {[0, 0.5, 1.0, 1.5].map((v) => (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={PAD_L + CW}
              y1={yOf(v)}
              y2={yOf(v)}
              stroke={colors.borderSoft}
            />
            <text
              x={PAD_L - 8}
              y={yOf(v) + 3}
              textAnchor="end"
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={10}
              fill={colors.textTertiary}
            >
              {v.toFixed(1)}
            </text>
          </g>
        ))}
        <text
          x={16}
          y={PAD_T + CH / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${PAD_T + CH / 2})`}
          fontFamily="var(--font-plex-mono), ui-monospace, monospace"
          fontSize={10}
          fill={colors.textTertiary}
        >
          ms / ct
        </text>

        {/* x ticks */}
        {BENCHMARKS.map((r) => (
          <g key={r.b}>
            <line
              x1={xOf(r.b)}
              x2={xOf(r.b)}
              y1={PAD_T + CH}
              y2={PAD_T + CH + 4}
              stroke="#c4b8a8"
            />
            <text
              x={xOf(r.b)}
              y={PAD_T + CH + 16}
              textAnchor="middle"
              fontFamily="var(--font-plex-mono), ui-monospace, monospace"
              fontSize={10}
              fill={colors.textTertiary}
            >
              {r.b}
            </text>
          </g>
        ))}
        <text
          x={PAD_L + CW / 2}
          y={H - 10}
          textAnchor="middle"
          fontFamily="var(--font-plex-mono), ui-monospace, monospace"
          fontSize={10}
          fill={colors.textTertiary}
        >
          Batch size B (log scale)
        </text>

        {/* fill between */}
        <path d={fillPath} fill={colors.solutionAccent} opacity={0.08} />

        {/* lines */}
        <path
          ref={pfePathRef}
          d={pfePath}
          fill="none"
          stroke={colors.problemAccent}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          ref={btxPathRef}
          d={btxPath}
          fill="none"
          stroke={colors.solutionAccent}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          d={beatPath}
          fill="none"
          stroke={colors.textTertiary}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          strokeLinecap="round"
          opacity={0.7}
        />

        {/* dots */}
        {BENCHMARKS.map((r) => (
          <g key={r.b}>
            <circle
              cx={xOf(r.b)}
              cy={yOf(r.pfePre)}
              r={4}
              fill={colors.problemBg}
              stroke={colors.problemAccent}
              strokeWidth={2}
            />
            <circle
              cx={xOf(r.b)}
              cy={yOf(r.btxPre)}
              r={4}
              fill={colors.solutionBg}
              stroke={colors.solutionAccent}
              strokeWidth={2}
            />
          </g>
        ))}

        {/* hover hairline */}
        <line
          x1={hoverX}
          x2={hoverX}
          y1={PAD_T}
          y2={PAD_T + CH}
          stroke={colors.textPrimary}
          strokeWidth={1}
          opacity={hover !== null ? 0.25 : 0}
          pointerEvents="none"
        />

        <rect
          ref={hitRef}
          x={PAD_L}
          y={PAD_T}
          width={CW}
          height={CH}
          fill="transparent"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3.5 border-t border-border">
        <ReadoutCell label="B" value={String(row.b)} mono />
        <ReadoutCell
          label="PFE precompute"
          value={`${row.pfePre}`}
          unit="ms/ct"
          labelColor={colors.problemAccentStrong}
        />
        <ReadoutCell
          label="BTX precompute"
          value={`${row.btxPre}`}
          unit="ms/ct"
          labelColor={colors.solutionAccent}
        />
        <ReadoutCell
          label="Speedup"
          value={`${speedup}×`}
          valueColor={colors.solutionAccent}
        />
      </div>
    </>
  );
}

function ReadoutCell({
  label,
  value,
  unit,
  mono,
  labelColor,
  valueColor,
}: {
  label: string;
  value: string;
  unit?: string;
  mono?: boolean;
  labelColor?: string;
  valueColor?: string;
}) {
  return (
    <div>
      <p
        className="font-mono text-[10px] m-0 mb-0.5"
        style={{ color: labelColor ?? colors.textTertiary }}
      >
        {label}
      </p>
      <p
        className={`${mono ? "font-mono" : "font-mono"} text-[15px] font-semibold m-0`}
        style={{ color: valueColor ?? colors.textPrimary }}
      >
        {value}
        {unit && (
          <span className="text-[10px] text-text-tertiary ml-1 font-mono">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
