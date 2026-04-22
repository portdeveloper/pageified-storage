"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/lib/colors";
import { useInView } from "../useInView";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { useExplainMode } from "./ExplainModeContext";
import Hint from "./Hint";

type SchemeKind =
  | "comms"
  | "allornothing"
  | "slow"
  | "collision"
  | "crs"
  | "expensive";

interface Scheme {
  id: string;
  name: string;
  kind: SchemeKind;
}

const SCHEMES: Scheme[] = [
  { id: "naive", name: "Naïve threshold encryption", kind: "comms" },
  { id: "ibe", name: "Threshold IBE", kind: "allornothing" },
  { id: "early", name: "Early BTE (per-block MPC)", kind: "slow" },
  { id: "indexed", name: "Indexed BTE (BEAT-MEV, BEAT++)", kind: "collision" },
  { id: "trx", name: "TrX (Fernando et al.)", kind: "crs" },
  { id: "pfe", name: "PFE (Boneh et al.)", kind: "expensive" },
];

export default function EncryptedMempoolSection() {
  const { ref, isVisible } = useInView(0.1);
  const [activeId, setActiveId] = useState(SCHEMES[0].id);
  const active = SCHEMES.find((s) => s.id === activeId) ?? SCHEMES[0];
  const { mode } = useExplainMode();
  const simple = mode === "simple";

  return (
    <section
      id="problem-root"
      ref={ref}
      className="py-24 px-6 scroll-mt-16"
    >
      <div
        className={`max-w-[1120px] mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.015em]">
          {simple
            ? "Why this is hard to build"
            : "Why encrypted mempools are hard"}
        </h2>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-8">
          {simple ? (
            <>
              Scrambling transactions is the easy part. Unscrambling only the
              ones the builder picked, fast, without dropping any, without a
              big setup file — that&apos;s the hard part. Every earlier
              scheme gives up something. Pick one to see what.
            </>
          ) : (
            <>
              Transactions sit in the{" "}
              <Hint term="mempool">mempool</Hint> where anyone can read and
              front-run them. The fix: encrypt until block inclusion. Every
              prior scheme gives up something critical — pick an approach to
              see what breaks.
            </>
          )}
        </p>

        <div className="grid gap-6 md:[grid-template-columns:minmax(260px,340px)_1fr]">
          <div className="flex flex-col gap-1.5">
            {SCHEMES.map((s) => {
              const isActive = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={`text-left border rounded-[10px] px-3.5 py-3 transition-all duration-150 ${
                    isActive
                      ? "border-solution-accent bg-solution-bg"
                      : "border-border bg-surface-elevated hover:border-text-tertiary"
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow:
                            "0 0 0 3px color-mix(in oklab, " +
                            colors.solutionAccent +
                            " 12%, transparent)",
                        }
                      : undefined
                  }
                  aria-pressed={isActive}
                >
                  <span className="text-[13.5px] font-medium text-text-primary">
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-surface-elevated border border-border rounded-2xl p-[22px] min-h-[400px] relative overflow-hidden">
            <SchemeCanvas scheme={active} />
          </div>
        </div>

        <div
          className="mt-6 rounded-2xl border px-[22px] py-5 flex gap-3.5 items-start"
          style={{
            background: colors.solutionBg,
            borderColor:
              "color-mix(in oklab, " + colors.solutionAccent + " 22%, transparent)",
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-semibold text-white shrink-0"
            style={{ backgroundColor: colors.solutionAccent }}
            aria-hidden="true"
          >
            ✓
          </div>
          <p className="text-text-primary leading-[1.55]">
            {simple ? (
              <>
                <strong className="text-solution-accent">
                  BTX fills the gap:
                </strong>{" "}
                no dropped transactions, no recurring setup, scrambled
                transactions nearly as short as regular encryption, and
                opening only costs what the actual batch costs.
              </>
            ) : (
              <>
                <strong className="text-solution-accent">
                  BTX fills the gap:
                </strong>{" "}
                the first BTE scheme that is{" "}
                <strong>
                  <Hint term="collision-free">collision-free</Hint>,{" "}
                  <Hint term="epochless">epochless</Hint>, compact
                </strong>{" "}
                ({" "}
                <Hint term="ciphertext">ciphertext</Hint> as small as plain{" "}
                <Hint term="ElGamal">ElGamal</Hint>), and{" "}
                <strong>fast</strong> (decryption scales with the actual
                batch, not the maximum).
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function SchemeCanvas({ scheme }: { scheme: Scheme }) {
  return (
    <>
      <p className="text-[17px] font-semibold m-0 mb-4">{scheme.name}</p>
      {scheme.kind === "comms" && <CommsViz />}
      {scheme.kind === "allornothing" && <AllOrNothingViz />}
      {scheme.kind === "slow" && <SlowViz />}
      {scheme.kind === "collision" && <CollisionViz />}
      {scheme.kind === "crs" && <CrsViz />}
      {scheme.kind === "expensive" && <ExpensiveViz />}
    </>
  );
}

/* ---------- 1. Naïve: O(N·B) comms ---------- */
function CommsViz() {
  const N = 5;
  const B = 16;
  const TOTAL = N * B;
  const reduced = usePrefersReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const validatorRefs = useRef<(SVGCircleElement | null)[]>([]);
  const ctRefs = useRef<(SVGRectElement | null)[]>([]);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const [sent, setSent] = useState(0);

  const validators = useMemo(
    () =>
      Array.from({ length: N }).map((_, i) => ({
        x: 40,
        y: 30 + (i / Math.max(1, N - 1)) * 170,
      })),
    [N],
  );
  const cts = useMemo(
    () =>
      Array.from({ length: B }).map((_, j) => ({
        x: 360,
        y: 24 + (j / Math.max(1, B - 1)) * 182,
      })),
    [B],
  );

  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let idx = 0;
    let timer: ReturnType<typeof setTimeout>;

    const sendDot = (i: number, j: number) => {
      const svg = svgRef.current;
      const vEl = validatorRefs.current[i];
      const tEl = ctRefs.current[j];
      const edge = edgeRefs.current[i * B + j];
      if (!svg || !vEl || !tEl) return;
      const v = validators[i];
      const t = cts[j];
      const dot = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      dot.setAttribute("r", "2.4");
      dot.setAttribute("fill", colors.problemAccent);
      dot.setAttribute("cx", String(v.x));
      dot.setAttribute("cy", String(v.y));
      svg.appendChild(dot);
      const dur = 700 + Math.random() * 300;
      dot.animate(
        [
          { cx: v.x, cy: v.y, opacity: 1 },
          { cx: t.x, cy: t.y, opacity: 0.9 },
        ] as Keyframe[] & { cx: number; cy: number; opacity: number }[],
        { duration: dur, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
      );
      vEl.animate([{ r: 8 }, { r: 10 }, { r: 8 }], { duration: 350 });
      if (edge) {
        edge.animate(
          [
            { opacity: 0.18, strokeWidth: 0.35 },
            { opacity: 0.85, strokeWidth: 1.2 },
            { opacity: 0.18, strokeWidth: 0.35 },
          ],
          { duration: dur },
        );
      }
      setTimeout(() => {
        if (stopped) return;
        dot.remove();
        tEl.animate(
          [
            { fill: colors.problemAccentLight },
            { fill: colors.problemAccent },
            { fill: colors.problemAccentLight },
          ],
          { duration: 500 },
        );
      }, dur);
    };

    const tick = () => {
      if (stopped) return;
      const perTick = Math.max(1, Math.round(TOTAL / 40));
      for (let k = 0; k < perTick; k++) {
        const i = Math.floor(idx / B);
        const j = idx % B;
        sendDot(i, j);
        idx = (idx + 1) % TOTAL;
      }
      const displayed = idx === 0 ? TOTAL : idx;
      setSent(displayed);
      if (idx === 0) {
        timer = setTimeout(() => {
          if (stopped) return;
          setSent(0);
          timer = setTimeout(tick, 900);
        }, 1200);
        return;
      }
      timer = setTimeout(tick, TOTAL > 100 ? 110 : 180);
    };

    timer = setTimeout(tick, 400);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [B, TOTAL, cts, reduced, validators]);

  return (
    <div>
      <p className="text-text-secondary text-[14px] leading-[1.55] mb-4">
        Every validator sends a decryption share for every ciphertext. With N
        validators × B transactions per block, messages scale as O(N·B) —
        unmanageable at scale.
      </p>
      <div className="h-[220px] flex items-center justify-center">
        <svg ref={svgRef} viewBox="0 0 400 220" className="w-full h-full">
          <g
            fontFamily="var(--font-plex-mono), ui-monospace, monospace"
            fontSize={9}
            fill={colors.textTertiary}
            letterSpacing={0.6}
          >
            <text x={40} y={14} textAnchor="middle">
              VALIDATORS
            </text>
            <text x={360} y={14} textAnchor="middle">
              CIPHERTEXTS
            </text>
          </g>
          {validators.map((v, i) =>
            cts.map((t, j) => (
              <line
                key={`${i}-${j}`}
                ref={(el) => {
                  edgeRefs.current[i * B + j] = el;
                }}
                x1={48}
                y1={v.y}
                x2={353}
                y2={t.y}
                stroke={colors.problemAccent}
                strokeWidth={0.35}
                opacity={0.18}
              />
            )),
          )}
          {validators.map((v, i) => (
            <circle
              key={i}
              ref={(el) => {
                validatorRefs.current[i] = el;
              }}
              cx={v.x}
              cy={v.y}
              r={8}
              fill={colors.solutionAccentLight}
              stroke={colors.solutionAccent}
              strokeWidth={1.2}
            />
          ))}
          {cts.map((t, j) => (
            <rect
              key={j}
              ref={(el) => {
                ctRefs.current[j] = el;
              }}
              x={354}
              y={t.y - 3}
              width={14}
              height={6}
              rx={1}
              fill={colors.problemAccentLight}
            />
          ))}
        </svg>
      </div>
      <div className="flex justify-between items-center mt-2 font-mono text-[11px] text-text-tertiary">
        <span>
          N = {N}, B = {B}
        </span>
        <span>
          messages sent:{" "}
          <span
            className="font-semibold tabular-nums"
            style={{ color: colors.problemAccentStrong }}
          >
            {sent}
          </span>{" "}
          /{" "}
          <span
            className="font-semibold"
            style={{ color: colors.problemAccentStrong }}
          >
            {TOTAL}
          </span>
        </span>
      </div>
    </div>
  );
}

/* ---------- 2. IBE: all-or-nothing ---------- */
function AllOrNothingViz() {
  const [released, setReleased] = useState(false);
  const [selected] = useState<Set<number>>(() => {
    const s = new Set<number>();
    while (s.size < 12) s.add(Math.floor(Math.random() * 48));
    return s;
  });
  return (
    <div>
      <p className="text-text-secondary text-[14px] leading-[1.55] mb-4">
        Releasing the epoch key decrypts <em>every</em> ciphertext in the
        epoch — including ones that weren&apos;t in any block. No selective
        privacy.
      </p>
      <div className="flex gap-1.5 p-3 bg-surface rounded-lg flex-wrap">
        {Array.from({ length: 48 }).map((_, i) => {
          const bg = released
            ? colors.solutionAccentLight
            : selected.has(i)
              ? colors.problemAccentLight
              : colors.border;
          return (
            <div
              key={i}
              className="w-4 h-4 rounded-[2px]"
              style={{
                backgroundColor: bg,
                transition: `background 0.3s ${released ? (i * 15) / 1000 : 0}s`,
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-center mt-3">
        <button
          type="button"
          onClick={() => setReleased(true)}
          className="font-mono text-[11px] px-3.5 py-2 rounded-lg text-white"
          style={{ backgroundColor: colors.problemAccent }}
        >
          Release epoch key
        </button>
      </div>
      {released && (
        <p
          className="font-mono text-[11px] mt-2.5 text-center"
          style={{ color: colors.problemAccentStrong }}
        >
          ✗ all 48 revealed — privacy gone
        </p>
      )}
    </div>
  );
}

/* ---------- 3. Early BTE: too slow ---------- */
function SlowViz() {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 80);
    return () => clearTimeout(t);
  }, []);
  return (
    <div>
      <p className="text-text-secondary text-[14px] leading-[1.55] mb-4">
        Running a fresh MPC setup every single block is far too slow to keep
        up with modern block times.
      </p>
      <div className="flex gap-4 items-stretch">
        <div className="flex-1 bg-surface rounded-lg p-3.5">
          <p className="font-mono text-[10px] text-text-tertiary uppercase mb-2">
            Block time budget
          </p>
          <div className="h-[18px] bg-border rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0"
              style={{ width: "20%", background: colors.solutionAccent }}
            />
          </div>
          <p className="font-mono text-[11px] mt-1.5 text-text-secondary">
            ~400ms
          </p>
        </div>
        <div
          className="flex-1 rounded-lg p-3.5"
          style={{ background: colors.problemBg }}
        >
          <p
            className="font-mono text-[10px] uppercase mb-2"
            style={{ color: colors.problemAccentStrong }}
          >
            MPC setup ceremony
          </p>
          <div className="h-[18px] bg-border rounded-full overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: animate ? "420%" : "0%",
                background: colors.problemAccent,
                transition: "width 1.8s linear",
              }}
            />
          </div>
          <p
            className="font-mono text-[11px] mt-1.5"
            style={{ color: colors.problemAccentStrong }}
          >
            seconds → minutes
          </p>
        </div>
      </div>
      <p
        className="font-mono text-[11px] mt-3 text-center"
        style={{ color: colors.problemAccentStrong }}
      >
        ✗ ceremony overflows budget on every block
      </p>
    </div>
  );
}

/* ---------- 4. Indexed BTE: collision ---------- */
function CollisionViz() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      setT((prev) => (prev + 1) % 240);
      timer = setTimeout(() => {
        raf = requestAnimationFrame(step);
      }, 50);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveT = reduced ? 140 : t;
  const alicePos = Math.min(100, effectiveT * 1.2);
  const attackPos = Math.min(100, (effectiveT + 40) * 1.2);
  const aliceFaded = effectiveT > 80 && effectiveT < 120;
  const attackerLanded = effectiveT > 100;
  const collided = effectiveT > 120;

  return (
    <div>
      <p className="text-text-secondary text-[14px] leading-[1.55] mb-4">
        Two users can collide on the same index. Worse: an attacker can
        deliberately publish a ciphertext at index 7 to <em>censor</em>{" "}
        Alice&apos;s.
      </p>
      <div className="grid [grid-template-columns:auto_1fr_auto] gap-x-3 gap-y-2 items-center font-mono text-[12px]">
        <span
          className="font-semibold px-2 py-0.5 rounded-full text-[11px]"
          style={{ color: colors.userAccent, background: colors.userBg }}
        >
          Alice
        </span>
        <div className="relative h-7 bg-surface rounded-md overflow-hidden">
          <div
            className="absolute top-1/2 px-2 py-0.5 rounded"
            style={{
              left: alicePos + "%",
              transform: "translate(-50%, -50%)",
              background: colors.userAccentLight,
              color: colors.userAccent,
              fontSize: 10,
              opacity: aliceFaded ? 0.2 : 1,
              transition: "opacity 0.3s",
            }}
          >
            ct_A
          </div>
        </div>
        <span className="text-text-tertiary text-[10px]">idx 7</span>

        <span
          className="font-semibold px-2 py-0.5 rounded-full text-[11px]"
          style={{
            color: colors.problemAccent,
            background: colors.problemBg,
          }}
        >
          Attacker
        </span>
        <div className="relative h-7 bg-surface rounded-md overflow-hidden">
          <div
            className="absolute top-1/2 px-2 py-0.5 rounded"
            style={{
              left: attackPos + "%",
              transform: "translate(-50%, -50%)",
              background: attackerLanded
                ? colors.problemAccent
                : colors.problemAccentLight,
              color: attackerLanded ? "white" : colors.problemAccent,
              fontSize: 10,
            }}
          >
            ct_X {attackerLanded ? "✓" : ""}
          </div>
        </div>
        <span className="text-text-tertiary text-[10px]">idx 7</span>
      </div>

      <div
        className="mt-4 px-3.5 py-2.5 rounded-lg border transition-all"
        style={{
          background: collided ? colors.problemBg : colors.surface,
          borderColor: collided ? colors.problemAccentLight : colors.border,
        }}
      >
        <p
          className="font-mono text-[11px] m-0"
          style={{
            color: collided ? colors.problemAccentStrong : colors.textTertiary,
          }}
        >
          {collided
            ? "✗ Collision on idx 7 — Alice censored"
            : "… both users send to same slot"}
        </p>
      </div>
    </div>
  );
}

/* ---------- 5. TrX: CRS grows forever ---------- */
function CrsViz() {
  const reduced = usePrefersReducedMotion();
  const [b, setB] = useState(1);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (stopped) return;
      setB((prev) => {
        const next = prev + Math.ceil(Math.random() * 50);
        if (next / 20 >= 100) return 1;
        return next;
      });
      timer = setTimeout(tick, 120);
    };
    timer = setTimeout(tick, 120);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);
  const pct = Math.min(100, b / 20);
  return (
    <div>
      <p className="text-text-secondary text-[14px] leading-[1.55] mb-4">
        Common Reference String grows with the number of decryption sessions.
        On a long-lived chain, it grows without bound.
      </p>
      <div className="p-5 bg-surface rounded-[10px]">
        <div className="h-3 bg-border rounded-md overflow-hidden mb-2">
          <div
            className="h-full"
            style={{
              background: colors.problemAccent,
              width: pct + "%",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div className="flex justify-between font-mono text-[11px] text-text-secondary">
          <span>Block {b.toLocaleString()}</span>
          <span>
            CRS size:{" "}
            <span
              className="font-semibold"
              style={{ color: colors.problemAccentStrong }}
            >
              {(32 + b * 0.04).toFixed(1)} KB
            </span>
          </span>
        </div>
      </div>
      <p
        className="font-mono text-[11px] mt-3.5 text-center"
        style={{ color: colors.problemAccentStrong }}
      >
        ✗ unbounded growth
      </p>
    </div>
  );
}

/* ---------- 6. PFE: expensive compute ---------- */
function ExpensiveViz() {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (stopped) return;
      setStep((prev) => (prev + 1) % 6);
      timer = setTimeout(tick, 700);
    };
    timer = setTimeout(tick, 700);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveStep = reduced ? 5 : step;
  const pfePairing =
    effectiveStep >= 1 && effectiveStep <= 4 ? effectiveStep : null;
  // PFE G₁ segments are targeted by pairings 1 and 2; G_T by 3 and 4.
  const pfeSegHighlight = (n: string) =>
    pfePairing !== null && n.split(" ").includes(String(pfePairing));
  const btxActive = effectiveStep === 1; // BTX fires its single pairing at step 1

  return (
    <div>
      <p className="text-text-secondary text-[14px] leading-[1.55] mb-4">
        PFE is collision-free and epochless — but its ciphertext carries 2 G₁
        elements (vs BTX&apos;s 1) and decryption runs 4 pairings per open.
        Heavy concretely.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-3.5 rounded-[10px] border"
          style={{
            background: colors.problemBg,
            borderColor: colors.problemAccentLight,
          }}
        >
          <p
            className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold mb-2.5"
            style={{ color: colors.problemAccentStrong }}
          >
            PFE open
          </p>
          <div className="flex gap-1 mb-2.5">
            <Seg
              color={colors.problemAccentLight}
              fg={colors.problemAccentStrong}
              label="G₁"
              flex={1}
              highlight={pfeSegHighlight("1") ? colors.problemAccent : undefined}
            />
            <Seg
              color={colors.problemAccentLight}
              fg={colors.problemAccentStrong}
              label="G₁"
              flex={1}
              highlight={pfeSegHighlight("2") ? colors.problemAccent : undefined}
            />
            <Seg
              color={colors.problemAccent}
              fg="white"
              label="G_T"
              flex={2}
              highlight={pfeSegHighlight("3 4") ? colors.problemAccent : undefined}
            />
          </div>
          <div className="flex gap-1 mb-1.5">
            {[1, 2, 3, 4].map((i) => (
              <PairingPill
                key={i}
                label={`e${i}`}
                active={pfePairing === i}
                tone="problem"
              />
            ))}
          </div>
          <p
            className="font-mono text-[10px] mt-2.5"
            style={{ color: colors.problemAccentStrong }}
          >
            4 pairings per open · 0.723 ms/ct
          </p>
        </div>
        <div
          className="p-3.5 rounded-[10px] border"
          style={{
            background: colors.solutionBg,
            borderColor:
              "color-mix(in oklab, " + colors.solutionAccent + " 30%, transparent)",
          }}
        >
          <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold mb-2.5 text-solution-accent">
            BTX open
          </p>
          <div className="flex gap-1 mb-2.5">
            <Seg
              color={colors.solutionAccentLight}
              fg={colors.solutionAccent}
              label="G₁"
              flex={1}
              highlight={btxActive ? colors.solutionAccent : undefined}
            />
            <Seg
              color={colors.solutionAccent}
              fg="white"
              label="G_T"
              flex={2}
              highlight={btxActive ? colors.solutionAccent : undefined}
            />
          </div>
          <div className="flex gap-1 mb-1.5">
            <PairingPill label="e1" active={btxActive} tone="solution" />
            <div style={{ flex: 3 }} />
          </div>
          <p className="font-mono text-[10px] mt-2.5 text-solution-accent">
            1 pairing per open · 0.171 ms/ct
          </p>
        </div>
      </div>
      <p
        className="font-mono text-[11px] text-center mt-3.5"
        style={{ minHeight: 16 }}
      >
        {pfePairing !== null ? (
          <span style={{ color: colors.problemAccentStrong }}>
            PFE pairing {pfePairing}/4
          </span>
        ) : effectiveStep === 5 ? (
          <span
            className="font-semibold"
            style={{ color: colors.solutionAccent }}
          >
            BTX finished at step 1 · 4.2× faster per ct
          </span>
        ) : null}
      </p>
    </div>
  );
}

function Seg({
  color,
  fg,
  label,
  flex,
  highlight,
}: {
  color: string;
  fg: string;
  label: string;
  flex: number;
  highlight?: string;
}) {
  return (
    <div
      className="h-[26px] rounded flex items-center justify-center font-mono text-[10px] transition-[box-shadow] duration-200"
      style={{
        background: color,
        color: fg,
        flex,
        boxShadow: highlight ? `0 0 0 2px ${highlight}` : "none",
      }}
    >
      {label}
    </div>
  );
}

function PairingPill({
  label,
  active,
  tone,
}: {
  label: string;
  active: boolean;
  tone: "problem" | "solution";
}) {
  const accent =
    tone === "problem" ? colors.problemAccent : colors.solutionAccent;
  const fg = tone === "problem" ? colors.problemAccentStrong : colors.solutionAccent;
  return (
    <div
      className="h-[14px] rounded-[3px] flex items-center justify-center font-mono text-[9px] transition-all duration-200"
      style={{
        flex: 1,
        background: active
          ? accent
          : `color-mix(in oklab, ${accent} 22%, transparent)`,
        color: active ? "white" : fg,
        transform: active ? "scale(1.08)" : "scale(1)",
      }}
    >
      {label}
    </div>
  );
}
