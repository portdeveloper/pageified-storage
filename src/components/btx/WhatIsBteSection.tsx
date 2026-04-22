"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import { usePrefersReducedMotion } from "./useReducedMotion";
import Hint from "./Hint";

export default function WhatIsBteSection() {
  return (
    <section className="py-24 px-6 bg-surface relative">
      <div className="max-w-[1120px] mx-auto">
        <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.015em]">
          What MEV looks like
        </h2>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-4">
          Every pending transaction on a public chain sits in the{" "}
          <Hint term="mempool">mempool</Hint> in plain view. Before a block is
          built, anyone can read what&apos;s coming. Bots read. Bots react.
        </p>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-10">
          That&apos;s how{" "}
          <Hint term="MEV">MEV</Hint> happens. Here are the three shapes it
          takes, and the fix.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <ProblemCard
            label="01 · The mempool is public"
            body={
              <>
                Pending transactions are broadcast before they execute. Anyone
                watching the network sees them, including searchers running{" "}
                <Hint term="front-running">front-running</Hint> bots.
              </>
            }
          >
            <PublicMempoolViz />
          </ProblemCard>
          <ProblemCard
            label="02 · Bots sandwich users"
            body={
              <>
                A bot spots a pending swap, buys ahead to push the price up,
                lets the user&apos;s swap execute at the worse price, then
                sells behind it. That&apos;s a{" "}
                <Hint term="sandwich">sandwich</Hint>.
              </>
            }
          >
            <SandwichViz />
          </ProblemCard>
          <ProblemCard
            label="03 · Encrypt until block inclusion"
            body={
              <>
                If transactions are encrypted until the builder commits to a
                batch, there&apos;s nothing for bots to read. An{" "}
                <Hint term="encrypted mempool">encrypted mempool</Hint> cuts
                the attack surface at its source.
              </>
            }
          >
            <EncryptedMempoolViz />
          </ProblemCard>
        </div>

        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-4">
          Encrypting is the easy part. The hard part is decrypting only the
          transactions the builder actually picks, fast, without dropping
          anything, without a trusted party that could reveal them early.
        </p>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-10">
          That&apos;s what{" "}
          <Hint term="threshold encryption">threshold encryption</Hint>{" "}
          does: a committee of servers jointly holds the decryption key, and
          enough of them have to cooperate before any ciphertext is opened.
          BTX is a new scheme that makes it small, fast, collision-free, and
          setup-free, all at once, for the first time.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-5">
            <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-2">
              Without encryption
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Bots read every pending transaction and jump the queue. Users
              pay more, sometimes get nothing.
            </p>
          </div>
          <div className="bg-user-bg rounded-xl border border-user-cell p-5">
            <p className="font-mono text-xs text-user-muted uppercase tracking-wider mb-2">
              With threshold encryption
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Transactions stay encrypted until the builder picks a batch.
              Only that batch is decrypted. The rest stay private.
            </p>
          </div>
          <div className="bg-solution-bg rounded-xl border border-solution-cell p-5">
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-2">
              What BTX adds
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Shorter ciphertexts, no dropped transactions, no setup ceremony,
              fast enough for real block times.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemCard({
  label,
  body,
  children,
}: {
  label: string;
  body: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-elevated border border-border rounded-2xl p-[22px] flex flex-col">
      <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-text-tertiary font-semibold mb-3">
        {label}
      </p>
      <div className="mb-3.5">{children}</div>
      <p className="text-[13.5px] text-text-secondary leading-[1.55]">
        {body}
      </p>
    </div>
  );
}

/* ---------- 01 · Public mempool: bots read pending txs ---------- */
function PublicMempoolViz() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (stopped) return;
      setT((prev) => (prev + 1) % 180);
      timer = setTimeout(step, 50);
    };
    timer = setTimeout(step, 50);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveT = reduced ? 120 : t;
  // 5 pending transactions; bot reads them one by one
  const scanIndex = Math.floor(effectiveT / 12) % 5;
  const txs = [
    "swap 100 USDC → ETH",
    "approve DEX",
    "transfer 2.4 ETH",
    "mint NFT",
    "swap 50 ETH → USDC",
  ];

  return (
    <div className="h-[180px] bg-surface border border-border rounded-lg p-3 flex flex-col gap-1.5 relative overflow-hidden">
      <p className="font-mono text-[9px] text-text-tertiary uppercase tracking-[0.08em] mb-1">
        pending transactions
      </p>
      {txs.map((tx, i) => {
        const active = i === scanIndex;
        return (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1 rounded transition-all"
            style={{
              background: active
                ? "color-mix(in oklab, " +
                  colors.problemAccent +
                  " 12%, transparent)"
                : "transparent",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: active ? colors.problemAccent : colors.textTertiary,
                transition: "background 0.2s",
              }}
            />
            <span
              className="font-mono text-[10px] flex-1 truncate"
              style={{
                color: active ? colors.problemAccentStrong : colors.textSecondary,
              }}
            >
              {tx}
            </span>
            {active && (
              <span
                className="font-mono text-[9px] font-semibold"
                style={{ color: colors.problemAccentStrong }}
              >
                👁 read
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- 02 · Sandwich attack ---------- */
function SandwichViz() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (stopped) return;
      setT((prev) => (prev + 1) % 200);
      timer = setTimeout(step, 40);
    };
    timer = setTimeout(step, 40);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveT = reduced ? 160 : t;
  // Phases: 0 idle, 1 bot buy, 2 user swap, 3 bot sell
  const phase = effectiveT < 40 ? 0 : effectiveT < 90 ? 1 : effectiveT < 140 ? 2 : 3;
  const price = phase === 0 ? 100 : phase === 1 ? 104 : phase === 2 ? 108 : 103;

  return (
    <div className="h-[180px] bg-surface border border-border rounded-lg p-3 flex flex-col gap-2.5 relative">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] text-text-tertiary uppercase tracking-[0.08em]">
          pool price
        </span>
        <span
          className="font-mono text-[12px] font-semibold tabular-nums"
          style={{
            color:
              phase === 0
                ? colors.textPrimary
                : phase === 3
                  ? colors.problemAccentStrong
                  : colors.problemAccent,
            transition: "color 0.3s",
          }}
        >
          {price.toFixed(1)}
        </span>
      </div>
      <div className="relative h-10">
        {/* price line */}
        <svg viewBox="0 0 200 40" className="absolute inset-0 w-full h-full">
          <path
            d={`M 0 28 L 50 28 L 90 ${phase >= 1 ? 16 : 28} L 140 ${phase >= 2 ? 6 : phase >= 1 ? 16 : 28} L 200 ${phase >= 3 ? 20 : phase >= 2 ? 6 : phase >= 1 ? 16 : 28}`}
            stroke={colors.problemAccent}
            strokeWidth={1.6}
            fill="none"
            style={{ transition: "d 0.35s" }}
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <OrderRow
          label="bot buys"
          tone="problem"
          active={phase >= 1}
          detail="pushes price up"
        />
        <OrderRow
          label="user swaps"
          tone="user"
          active={phase >= 2}
          detail={phase >= 2 ? "gets worse rate" : "pending"}
        />
        <OrderRow
          label="bot sells"
          tone="problem"
          active={phase >= 3}
          detail="profit"
        />
      </div>
    </div>
  );
}

function OrderRow({
  label,
  tone,
  active,
  detail,
}: {
  label: string;
  tone: "problem" | "user";
  active: boolean;
  detail: string;
}) {
  const accent =
    tone === "problem" ? colors.problemAccent : colors.userAccent;
  const strong =
    tone === "problem" ? colors.problemAccentStrong : colors.userAccent;
  return (
    <div
      className="flex items-center justify-between px-2 py-0.5 rounded"
      style={{
        background: active
          ? "color-mix(in oklab, " + accent + " 14%, transparent)"
          : "transparent",
        opacity: active ? 1 : 0.45,
        transition: "opacity 0.3s, background 0.3s",
      }}
    >
      <span
        className="font-mono text-[10px] font-semibold"
        style={{ color: active ? strong : colors.textTertiary }}
      >
        {label}
      </span>
      <span
        className="font-mono text-[9px]"
        style={{ color: active ? strong : colors.textTertiary }}
      >
        {detail}
      </span>
    </div>
  );
}

/* ---------- 03 · Encrypted mempool fix ---------- */
function EncryptedMempoolViz() {
  const reduced = usePrefersReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (stopped) return;
      setT((prev) => (prev + 1) % 220);
      timer = setTimeout(step, 45);
    };
    timer = setTimeout(step, 45);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reduced]);

  const effectiveT = reduced ? 160 : t;
  // Phase 0: all encrypted. Phase 1: builder picks. Phase 2: decrypt. Phase 3: execute.
  const phase =
    effectiveT < 50 ? 0 : effectiveT < 110 ? 1 : effectiveT < 170 ? 2 : 3;
  const N = 5;
  const picked = new Set([1, 3]);

  return (
    <div className="h-[180px] bg-surface border border-border rounded-lg p-3 flex flex-col gap-1.5 relative overflow-hidden">
      <p className="font-mono text-[9px] text-text-tertiary uppercase tracking-[0.08em] mb-1">
        {phase === 0
          ? "all encrypted"
          : phase === 1
            ? "builder picks"
            : phase === 2
              ? "committee decrypts"
              : "block executes"}
      </p>
      {Array.from({ length: N }).map((_, i) => {
        const isPicked = picked.has(i);
        const decrypted = phase >= 2 && isPicked;
        const selected = phase >= 1 && isPicked;
        return (
          <div
            key={i}
            className="flex items-center gap-2 px-2 py-1 rounded transition-all"
            style={{
              background: selected
                ? decrypted
                  ? colors.solutionBg
                  : "color-mix(in oklab, " +
                    colors.problemAccent +
                    " 12%, transparent)"
                : "transparent",
              borderLeft: selected
                ? `2px solid ${decrypted ? colors.solutionAccent : colors.problemAccent}`
                : "2px solid transparent",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: decrypted
                  ? colors.solutionAccent
                  : colors.textTertiary,
              }}
            />
            <span
              className="font-mono text-[10px] flex-1 truncate tabular-nums"
              style={{
                color: decrypted
                  ? colors.solutionAccent
                  : colors.textTertiary,
                letterSpacing: decrypted ? 0 : 1,
              }}
            >
              {decrypted
                ? i === 1
                  ? "swap 100 USDC → ETH"
                  : "transfer 2.4 ETH"
                : "████████████████"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
