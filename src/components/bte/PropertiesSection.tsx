"use client";

import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/colors";
import { useInView } from "../useInView";
import { usePrefersReducedMotion } from "./useReducedMotion";
import { useExplainMode } from "./ExplainModeContext";
import Hint from "./Hint";

export default function PropertiesSection() {
  const { ref, isVisible } = useInView(0.1);
  const { mode } = useExplainMode();
  const simple = mode === "simple";
  return (
    <section ref={ref} className="py-24 px-6 bg-surface">
      <div
        className={`max-w-[1120px] mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.015em]">
          {simple ? "What BTX gets right" : "Four properties, all at once"}
        </h2>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-8">
          {simple ? (
            <>
              BTX is the first scheme to get all four of these right at the
              same time. Users don&apos;t coordinate to encrypt. Setup happens
              once. Opening a batch costs what the batch actually costs, not
              the worst case.
            </>
          ) : (
            <>
              BTX is the first BTE scheme with all four. Encryption takes no
              coordination, setup is one-time, and decryption cost scales
              with the actual batch.
            </>
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PropertyCard
            title="Compact"
            body={
              simple ? (
                <>
                  A scrambled transaction in BTX is about as short as a
                  regular encrypted message. Every earlier scheme produced
                  something bigger.
                </>
              ) : (
                <>
                  <Hint term="ciphertext">Ciphertext</Hint> is the same size
                  as plain <Hint term="ElGamal">ElGamal</Hint>: one source
                  element plus one target element. Every prior BTE scheme
                  uses at least two source elements.
                </>
              )
            }
            footer="With BLS12-381: |G₁| = 48B, |G_T| = 576B"
          >
            <CompactViz />
          </PropertyCard>

          <PropertyCard
            title="Collision-free"
            body={
              simple ? (
                <>
                  You just encrypt your transaction. There&apos;s no slot to
                  fight over, so no one can block you by claiming the same
                  slot first.
                </>
              ) : (
                <>
                  A user just encrypts. Nothing to collide on → no censorship
                  via index <Hint term="collision">collision</Hint>.
                </>
              )
            }
          >
            <CollisionFreeViz />
          </PropertyCard>

          <PropertyCard
            title="Epochless"
            body={
              simple ? (
                <>
                  Your scrambled transaction isn&apos;t tied to a specific
                  block. If it misses block N, it&apos;s still fine for N+1,
                  N+2, and on. No reset days.
                </>
              ) : (
                <>
                  A ciphertext isn&apos;t bound to a block. If it isn&apos;t
                  included in N, it stays valid for N+1 and beyond. No{" "}
                  <Hint term="epoch">epochs</Hint>.
                </>
              )
            }
          >
            <EpochlessViz />
          </PropertyCard>

          <PropertyCard
            title={simple ? "Fast · pay for what you use" : "Fast · dynamic batch sizing"}
            body={
              simple ? (
                <>
                  Opening a batch of 50 costs what 50 costs. Earlier schemes
                  always charged you for the worst case — the biggest batch
                  the system could handle, even when the real batch was
                  tiny.
                </>
              ) : (
                <>
                  Decryption is <span className="font-mono">O(B log B)</span>{" "}
                  where B is the <strong>actual</strong> batch. Prior schemes
                  pay for the maximum Bmax, always.
                </>
              )
            }
          >
            <FastViz />
          </PropertyCard>
        </div>
      </div>
    </section>
  );
}

function PropertyCard({
  title,
  body,
  footer,
  children,
}: {
  title: string;
  body: React.ReactNode;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-[22px] h-full flex flex-col">
      <h3 className="text-[1.15rem] font-semibold mb-2">{title}</h3>
      <p className="text-[13.5px] text-text-secondary leading-[1.55] mb-4">
        {body}
      </p>
      <div className="mt-auto">{children}</div>
      {footer && (
        <p className="font-mono text-[10.5px] text-text-tertiary mt-3.5">
          {footer}
        </p>
      )}
    </div>
  );
}

/* ---------- P1: Compact ---------- */
function CompactViz() {
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

  const schemes: {
    name: string;
    parts: string[];
    bytes: number;
    hl?: boolean;
  }[] = [
    {
      name: "BEAT-MEV / Batched IBE",
      parts: ["G₁", "G₁", "G₁", "G_T"],
      bytes: 3 * 48 + 576,
    },
    {
      name: "TrX / BEAT++ / PFE",
      parts: ["G₁", "G₁", "G_T"],
      bytes: 2 * 48 + 576,
    },
    { name: "BTX", parts: ["G₁", "G_T"], bytes: 48 + 576, hl: true },
  ];

  let segIndex = 0;
  return (
    <div ref={ref} className="flex flex-col gap-3">
      {schemes.map((s) => (
        <div key={s.name}>
          <div className="flex justify-between mb-1">
            <span
              className="font-mono text-[11px]"
              style={{
                color: s.hl ? colors.solutionAccent : colors.textTertiary,
                fontWeight: s.hl ? 600 : 400,
              }}
            >
              {s.name}
            </span>
            <span
              className="font-mono text-[10.5px]"
              style={{ color: colors.textTertiary }}
            >
              {s.bytes}B
            </span>
          </div>
          <div className="flex gap-[3px]">
            {s.parts.map((p) => {
              const isT = p === "G_T";
              const flex = isT ? 6 : 1;
              const bg = s.hl
                ? isT
                  ? colors.solutionAccent
                  : colors.solutionAccentLight
                : isT
                  ? colors.textTertiary
                  : colors.border;
              const fg = s.hl
                ? isT
                  ? "white"
                  : colors.solutionAccent
                : isT
                  ? "white"
                  : colors.textSecondary;
              const delay = segIndex * 60;
              segIndex += 1;
              return (
                <div
                  key={segIndex}
                  className="h-7 rounded-md flex items-center justify-center font-mono text-[11px]"
                  style={{
                    flex,
                    background: bg,
                    color: fg,
                    fontWeight: s.hl && !isT ? 600 : 500,
                    transform: revealed ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                    transition: `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
                  }}
                >
                  {p}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- P2: Collision-free (auto-tab) ---------- */
function CollisionFreeViz() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (stopped) return;
      setT((prev) => (prev + 1) % 180);
      timer = setTimeout(step, 60);
    };
    timer = setTimeout(step, 60);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveT = reduced ? 40 : t;
  const stage: "indexed" | "btx" = effectiveT < 90 ? "indexed" : "btx";
  const local = effectiveT < 90 ? effectiveT : effectiveT - 90;
  const alicePos = Math.min(100, local * 1.5);
  const attackPos = Math.min(100, (local + 20) * 1.5);
  const collided = stage === "indexed" && local > 55;
  const bothOk = stage === "btx" && local > 55;

  const setStage = (s: "indexed" | "btx") => setT(s === "indexed" ? 0 : 90);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Tab
          active={stage === "indexed"}
          onClick={() => setStage("indexed")}
          tone="problem"
          label="Indexed BTE"
        />
        <Tab
          active={stage === "btx"}
          onClick={() => setStage("btx")}
          tone="solution"
          label="BTX"
        />
      </div>

      <div
        className="rounded-[10px] border p-3.5"
        style={{
          background: stage === "indexed" ? colors.problemBg : colors.solutionBg,
          borderColor:
            stage === "indexed"
              ? colors.problemAccentLight
              : "color-mix(in oklab, " +
                colors.solutionAccent +
                " 22%, transparent)",
          transition: "all 0.3s",
        }}
      >
        <TrackRow
          user="alice"
          color={colors.userAccent}
          bg={colors.userBg}
          pos={alicePos}
          ctLabel="ct_A"
          suffix={stage === "indexed" ? "idx 7" : "encrypt"}
          faded={stage === "indexed" && collided}
        />
        <div className="h-2.5" />
        <TrackRow
          user="attacker"
          color={colors.problemAccent}
          bg={colors.problemBg}
          pos={attackPos}
          ctLabel={stage === "indexed" ? "ct_attack" : "ct_X"}
          suffix={stage === "indexed" ? "idx 7" : "encrypt"}
        />
        <p
          className="font-mono text-[11px] font-semibold mt-3 m-0 transition-opacity"
          style={{
            color:
              stage === "indexed"
                ? colors.problemAccentStrong
                : colors.solutionAccent,
            opacity: collided || bothOk ? 1 : 0.3,
          }}
        >
          {stage === "indexed"
            ? "✗ Alice tx censored"
            : "✓ No index · no collision surface"}
        </p>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  tone,
  label,
}: {
  active: boolean;
  onClick: () => void;
  tone: "problem" | "solution";
  label: string;
}) {
  const bg = active
    ? tone === "problem"
      ? colors.problemBg
      : colors.solutionBg
    : colors.surface;
  const color = active
    ? tone === "problem"
      ? colors.problemAccentStrong
      : colors.solutionAccent
    : colors.textTertiary;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 px-2 py-1.5 rounded-lg font-mono text-[10px] font-semibold"
      style={{ background: bg, color, border: "none", cursor: "pointer" }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function TrackRow({
  user,
  color,
  bg,
  pos,
  ctLabel,
  suffix,
  faded,
}: {
  user: string;
  color: string;
  bg: string;
  pos: number;
  ctLabel: string;
  suffix: string;
  faded?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full text-center"
        style={{ color, background: bg, minWidth: 62 }}
      >
        {user}
      </span>
      <div
        className="flex-1 h-[22px] rounded relative overflow-hidden"
        style={{ background: colors.surface }}
      >
        <div
          className="absolute top-1/2 px-1.5 py-0.5 rounded"
          style={{
            left: pos + "%",
            transform: "translate(-50%, -50%)",
            background: color,
            color: "white",
            fontFamily: "var(--font-plex-mono), ui-monospace, monospace",
            fontSize: 9.5,
            opacity: faded ? 0.2 : 1,
            transition: "opacity 0.3s",
          }}
        >
          {ctLabel}
        </div>
      </div>
      <span
        className="font-mono text-[9.5px] text-text-tertiary"
        style={{ width: 40 }}
      >
        {suffix}
      </span>
    </div>
  );
}

/* ---------- P3: Epochless (auto-cycling rows) ---------- */
function EpochlessViz() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (stopped) return;
      setT((prev) => (prev + 1) % 150);
      timer = setTimeout(step, 80);
    };
    timer = setTimeout(step, 80);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveT = reduced ? 60 : t;
  const phase: "epoch" | "btx" = effectiveT < 75 ? "epoch" : "btx";
  const local = phase === "epoch" ? effectiveT : effectiveT - 75;
  const nextBlock = local > 50;

  return (
    <div className="flex flex-col gap-3.5">
      {(
        [
          { label: "Epoch-bound BTE", key: "epoch" as const },
          { label: "BTX", key: "btx" as const },
        ]
      ).map((row) => {
        const active = phase === row.key;
        const expired = row.key === "epoch" && active && nextBlock;
        const ctColor =
          row.key === "epoch" ? colors.problemAccent : colors.solutionAccent;
        const blockBg =
          row.key === "epoch" ? colors.problemBg : colors.solutionBg;
        return (
          <div
            key={row.key}
            style={{ opacity: active ? 1 : 0.35, transition: "opacity 0.3s" }}
          >
            <p
              className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold mb-1.5"
              style={{
                color:
                  row.key === "epoch"
                    ? colors.problemAccentStrong
                    : colors.solutionAccent,
              }}
            >
              {row.label}
            </p>
            <div className="grid grid-cols-2 gap-2 relative">
              <BlockBox label="Block N" bg={blockBg}>
                <div
                  className="font-mono text-[10px]"
                  style={{
                    color: ctColor,
                    opacity: active && !nextBlock ? 1 : 0.2,
                    transition: "opacity 0.3s",
                  }}
                >
                  {row.key === "epoch" ? "ct tagged N" : "ct"}
                </div>
              </BlockBox>
              <BlockBox label="Block N+1" bg={blockBg}>
                <div
                  className="font-mono text-[10px] font-semibold"
                  style={{
                    color: expired ? colors.problemAccentStrong : ctColor,
                    opacity: nextBlock && active ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                >
                  {expired ? "✗ expired" : "✓ still valid"}
                </div>
              </BlockBox>
              <div
                className="absolute font-mono text-[12px] text-text-tertiary"
                style={{
                  left: "calc(50% - 9px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                →
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlockBox({
  label,
  bg,
  children,
}: {
  label: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg border p-3 relative"
      style={{
        background: bg,
        borderColor: colors.border,
        minHeight: 56,
      }}
    >
      <p className="font-mono text-[9px] text-text-tertiary uppercase m-0 mb-1">
        {label}
      </p>
      {children}
    </div>
  );
}

/* ---------- P4: Fast · slider ---------- */
function FastViz() {
  const [B, setB] = useState(128);
  const Bmax = 512;
  const actualCost = B * Math.log2(Math.max(2, B));
  const maxCost = Bmax * Math.log2(Bmax);
  const actualPct = (actualCost / maxCost) * 100;
  const saved = Math.round((1 - actualPct / 100) * 100);

  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="font-mono text-[10.5px] text-text-tertiary">
          Actual batch B
        </span>
        <span className="font-mono text-[13px] font-semibold tabular-nums">
          {B}
        </span>
      </div>
      <input
        type="range"
        min={16}
        max={Bmax}
        step={16}
        value={B}
        onChange={(e) => setB(Number(e.target.value))}
        aria-label={`Actual batch size ${B} of ${Bmax}`}
        className="w-full accent-solution-accent cursor-pointer"
      />
      <div className="flex justify-between font-mono text-[9.5px] text-text-tertiary mt-0.5 mb-4">
        <span>16</span>
        <span>Bmax = {Bmax}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <div>
          <div className="flex justify-between font-mono text-[10.5px] mb-1">
            <span
              className="font-semibold"
              style={{ color: colors.problemAccentStrong }}
            >
              Prior · O(Bmax log Bmax)
            </span>
            <span style={{ color: colors.textSecondary }}>
              {maxCost.toFixed(0)} units
            </span>
          </div>
          <div
            className="h-[22px] rounded-md overflow-hidden relative"
            style={{ background: colors.border }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(45deg, ${colors.problemAccentLight}, ${colors.problemAccentLight} 6px, ${colors.problemBg} 6px, ${colors.problemBg} 12px)`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: colors.problemAccent, opacity: 0.85 }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between font-mono text-[10.5px] mb-1">
            <span
              className="font-semibold"
              style={{ color: colors.solutionAccent }}
            >
              BTX · O(B log B)
            </span>
            <span style={{ color: colors.textSecondary }}>
              {actualCost.toFixed(0)} units
            </span>
          </div>
          <div
            className="h-[22px] rounded-md overflow-hidden"
            style={{ background: colors.border }}
          >
            <div
              style={{
                height: "100%",
                width: actualPct + "%",
                background: colors.solutionAccent,
                transition: "width 0.25s cubic-bezier(0.2,0.8,0.2,1)",
              }}
            />
          </div>
        </div>
      </div>
      <p
        className="font-mono text-[10.5px] mt-3.5 leading-[1.55]"
        style={{ color: colors.textTertiary }}
      >
        PFE / BEAT++ pay for {saved}% max every block. BTX pays only for the
        actual batch.
      </p>
    </div>
  );
}
