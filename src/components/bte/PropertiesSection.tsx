"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useInView } from "../useInView";
import { Card } from "../ui/Card";

/* Property 1: Compact ciphertext — visual bar chart of group elements */
function CompactViz() {
  const schemes = [
    { name: "BEAT-MEV / Batched IBE", elems: 3, labels: ["G₁", "G₁", "G₁", "G_T"] },
    { name: "TrX / BEAT++ / PFE", elems: 2, labels: ["G₁", "G₁", "G_T"] },
    { name: "BTX", elems: 1, labels: ["G₁", "G_T"], highlight: true },
  ];
  return (
    <div className="space-y-3">
      {schemes.map((s) => (
        <div key={s.name}>
          <div className="flex items-center justify-between mb-1.5">
            <p
              className={`font-mono text-[11px] ${
                s.highlight
                  ? "text-solution-accent font-semibold"
                  : "text-text-tertiary"
              }`}
            >
              {s.name}
            </p>
            <p className="font-mono text-[10px] text-text-tertiary">
              {s.labels.length} elements
            </p>
          </div>
          <div className="flex gap-1">
            {s.labels.map((label, i) => {
              const isGT = label === "G_T";
              return (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0, opacity: 0 }}
                  whileInView={{ scaleX: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className={`h-6 rounded flex items-center justify-center font-mono text-[10px] origin-left ${
                    s.highlight
                      ? isGT
                        ? "bg-solution-accent text-white"
                        : "bg-solution-accent-light text-solution-accent font-semibold"
                      : isGT
                        ? "bg-text-tertiary text-white"
                        : "bg-border text-text-secondary"
                  }`}
                  style={{ flex: isGT ? 2 : 1 }}
                >
                  {label}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Property 2: Collision-free — two users picking the same index vs no index */
function CollisionViz() {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCycle((c) => c + 1), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      {/* Indexed BTE — collision */}
      <div>
        <p className="font-mono text-[10px] text-problem-accent-strong font-semibold mb-2">
          Indexed BTE
        </p>
        <div className="bg-surface rounded-lg p-3 border border-border">
          <div className="flex items-center gap-3 text-[11px]">
            <UserBubble name="Alice" color="#3b7dd8" />
            <span className="font-mono text-text-tertiary">idx 7</span>
            <span className="text-text-tertiary">→</span>
            <motion.div
              key={`a-${cycle}`}
              initial={{ opacity: 1 }}
              animate={{ opacity: [1, 1, 0.3] }}
              transition={{ duration: 2.5, times: [0, 0.6, 1] }}
              className="font-mono text-[10px] text-text-secondary bg-border rounded px-1.5 py-0.5"
            >
              ct_A
            </motion.div>
          </div>
          <div className="flex items-center gap-3 text-[11px] mt-2">
            <UserBubble name="Attacker" color="#c4653a" />
            <span className="font-mono text-text-tertiary">idx 7</span>
            <span className="text-text-tertiary">→</span>
            <motion.div
              key={`b-${cycle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 2.5, times: [0, 0.5, 0.7] }}
              className="font-mono text-[10px] text-problem-accent-strong bg-problem-accent/10 rounded px-1.5 py-0.5 font-semibold"
            >
              ct_attack ✓
            </motion.div>
          </div>
          <p className="font-mono text-[10px] text-problem-accent-strong mt-2">
            Collision → Alice&apos;s tx censored
          </p>
        </div>
      </div>

      {/* BTX — no index */}
      <div>
        <p className="font-mono text-[10px] text-solution-accent font-semibold mb-2">
          BTX
        </p>
        <div className="bg-solution-bg rounded-lg p-3 border border-solution-accent/30">
          <div className="flex items-center gap-3 text-[11px]">
            <UserBubble name="Alice" color="#3b7dd8" />
            <span className="text-text-tertiary">encrypt(tx)</span>
            <span className="text-text-tertiary">→</span>
            <span className="font-mono text-[10px] text-solution-accent bg-solution-accent-light rounded px-1.5 py-0.5">
              ct_A ✓
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] mt-2">
            <UserBubble name="Attacker" color="#c4653a" />
            <span className="text-text-tertiary">encrypt(tx)</span>
            <span className="text-text-tertiary">→</span>
            <span className="font-mono text-[10px] text-solution-accent bg-solution-accent-light rounded px-1.5 py-0.5">
              ct_X ✓
            </span>
          </div>
          <p className="font-mono text-[10px] text-solution-accent mt-2">
            No index. No collision surface.
          </p>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color, backgroundColor: color + "18" }}
    >
      {name}
    </span>
  );
}

/* Property 3: Epochless — rollover visualization */
function EpochlessViz() {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCycle((c) => c + 1), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      {/* Epoch-bound */}
      <div>
        <p className="font-mono text-[10px] text-problem-accent-strong font-semibold mb-2">
          Epoch-bound BTE
        </p>
        <div className="flex items-center gap-2">
          <BlockBox label="Block N" bg="#fdf6ef">
            <motion.div
              key={`eb-${cycle}`}
              animate={{ opacity: [1, 1, 0.2] }}
              transition={{ duration: 2.5, times: [0, 0.4, 1] }}
              className="font-mono text-[10px] text-text-secondary bg-surface-elevated rounded px-1.5 py-0.5 inline-block"
            >
              ct tagged N
            </motion.div>
          </BlockBox>
          <span className="text-text-tertiary">→</span>
          <BlockBox label="Block N+1" bg="#fdf6ef">
            <motion.span
              key={`eb-fail-${cycle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 2.5, times: [0, 0.5, 0.6] }}
              className="font-mono text-[10px] text-problem-accent-strong"
            >
              ✗ expired
            </motion.span>
          </BlockBox>
        </div>
        <p className="font-mono text-[10px] text-problem-accent-strong mt-2">
          Miss one block → ciphertext dies
        </p>
      </div>

      {/* BTX */}
      <div>
        <p className="font-mono text-[10px] text-solution-accent font-semibold mb-2">
          BTX
        </p>
        <div className="flex items-center gap-2">
          <BlockBox label="Block N" bg="#f0f7f5">
            <motion.div
              key={`btx-${cycle}`}
              animate={{ x: [0, 0, 80] }}
              transition={{ duration: 2.5, times: [0, 0.5, 1] }}
              className="font-mono text-[10px] text-solution-accent bg-solution-accent-light rounded px-1.5 py-0.5 inline-block font-semibold"
            >
              ct
            </motion.div>
          </BlockBox>
          <span className="text-text-tertiary">→</span>
          <BlockBox label="Block N+1" bg="#f0f7f5">
            <motion.span
              key={`btx-ok-${cycle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 2.5, times: [0, 0.6, 0.7] }}
              className="font-mono text-[10px] text-solution-accent"
            >
              ✓ still valid
            </motion.span>
          </BlockBox>
        </div>
        <p className="font-mono text-[10px] text-solution-accent mt-2">
          Same ciphertext rolls over
        </p>
      </div>
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
      className="rounded-lg border border-border px-3 py-2 flex-1 min-w-[90px]"
      style={{ backgroundColor: bg }}
    >
      <p className="font-mono text-[9px] text-text-tertiary mb-1 tracking-wider uppercase">
        {label}
      </p>
      <div className="h-5 flex items-center">{children}</div>
    </div>
  );
}

/* Property 4: Fast — scaling chart, O(B log B) vs O(Bmax log Bmax) */
function ScalingViz() {
  const [actualBatch, setActualBatch] = useState(128);
  const maxBatch = 512;

  const W = 280;
  const H = 120;
  const padL = 30;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxCost = maxBatch * Math.log2(maxBatch);
  const x = (b: number) => padL + (b / maxBatch) * chartW;
  const y = (cost: number) =>
    padT + chartH - (cost / maxCost) * chartH;

  const btxPath = Array.from({ length: 50 }, (_, i) => {
    const b = (i / 49) * actualBatch;
    const cost = b === 0 ? 0 : b * Math.log2(Math.max(2, b));
    return `${i === 0 ? "M" : "L"}${x(b)},${y(cost)}`;
  }).join(" ");

  const maxCostVal = maxBatch * Math.log2(maxBatch);
  const btxCost = actualBatch * Math.log2(Math.max(2, actualBatch));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] text-text-tertiary">
          Actual batch size B
        </p>
        <p className="font-mono text-[11px] font-semibold tabular-nums">
          {actualBatch}
        </p>
      </div>
      <input
        type="range"
        min={16}
        max={maxBatch}
        step={16}
        value={actualBatch}
        onChange={(e) => setActualBatch(Number(e.target.value))}
        aria-label={`Actual batch size, ${actualBatch} of ${maxBatch}`}
        className="w-full accent-solution-accent cursor-pointer"
      />
      <div className="flex justify-between font-mono text-[9px] text-text-tertiary mt-0.5 mb-3">
        <span>16</span>
        <span>Bmax = {maxBatch}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Axes */}
        <line
          x1={padL}
          y1={padT + chartH}
          x2={padL + chartW}
          y2={padT + chartH}
          stroke="#e2ddd7"
        />
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + chartH}
          stroke="#e2ddd7"
        />

        {/* Prior: constant O(Bmax log Bmax) */}
        <line
          x1={padL}
          y1={y(maxCostVal)}
          x2={padL + chartW}
          y2={y(maxCostVal)}
          stroke="#c4653a"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={padL + chartW - 4}
          y={y(maxCostVal) - 5}
          className="font-mono"
          fontSize={8}
          fill="#c4653a"
          textAnchor="end"
        >
          O(Bmax log Bmax), PFE / BEAT++
        </text>

        {/* BTX: scales with actual */}
        <path
          d={btxPath}
          fill="none"
          stroke="#2a7d6a"
          strokeWidth={2}
        />
        <circle cx={x(actualBatch)} cy={y(btxCost)} r={3.5} fill="#2a7d6a" />

        {/* Highlight gap */}
        <line
          x1={x(actualBatch)}
          y1={y(btxCost)}
          x2={x(actualBatch)}
          y2={y(maxCostVal)}
          stroke="#2a7d6a"
          strokeWidth={1}
          strokeDasharray="2 2"
          opacity={0.5}
        />

        {/* X ticks */}
        {[0, 128, 256, 384, 512].map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              y1={padT + chartH}
              x2={x(t)}
              y2={padT + chartH + 2}
              stroke="#9b9084"
            />
            <text
              x={x(t)}
              y={padT + chartH + 11}
              textAnchor="middle"
              className="font-mono"
              fontSize={7}
              fill="#9b9084"
            >
              {t}
            </text>
          </g>
        ))}

        {/* Label BTX */}
        <text
          x={x(actualBatch) - 4}
          y={y(btxCost) - 6}
          textAnchor="end"
          className="font-mono"
          fontSize={9}
          fill="#2a7d6a"
          fontWeight={600}
        >
          BTX: O(B log B)
        </text>
      </svg>
      <p className="font-mono text-[10px] text-text-tertiary mt-2 leading-relaxed">
        PFE and BEAT++ pay for Bmax whether it&apos;s used or not. BTX pays
        only for the actual batch size.
      </p>
    </div>
  );
}

/* Section container */

interface PropertyProps {
  tag: string;
  title: string;
  body: React.ReactNode;
  children: React.ReactNode;
}

function Property({ tag, title, body, children }: PropertyProps) {
  return (
    <Card className="h-full flex flex-col">
      <p className="font-mono text-[11px] text-solution-accent uppercase tracking-wider font-semibold mb-2">
        {tag}
      </p>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="text-sm text-text-secondary leading-relaxed mb-5">
        {body}
      </div>
      <div className="mt-auto pt-2">{children}</div>
    </Card>
  );
}

export default function PropertiesSection() {
  const { ref, isVisible } = useInView(0.1);
  return (
    <section ref={ref} className="py-24 px-6 bg-surface">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Four properties, all at once
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          BTX is the first BTE scheme that has all four at once. Users
          don&apos;t coordinate. Parameters don&apos;t grow. Nothing to trade
          off.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Property
            tag="Property 1"
            title="Compact"
            body={
              <>
                The ciphertext has{" "}
                <strong>the same size as a plain ElGamal encryption</strong>:
                one source group element plus one target group element. Every
                prior BTE scheme uses at least two source group elements.
              </>
            }
          >
            <CompactViz />
          </Property>

          <Property
            tag="Property 2"
            title="Collision-free"
            body={
              <>
                A user just encrypts, with nothing to coordinate on. An
                attacker can&apos;t collide with your transaction to force
                censorship because there&apos;s nothing to collide on.
              </>
            }
          >
            <CollisionViz />
          </Property>

          <Property
            tag="Property 3"
            title="Epochless"
            body={
              <>
                A ciphertext isn&apos;t bound to a specific block or session.
                If the block builder doesn&apos;t include it in block N, it
                stays valid (and stays private) for block N+1 and beyond.
              </>
            }
          >
            <EpochlessViz />
          </Property>

          <Property
            tag="Property 4"
            title="Fast. Scales with actual batch."
            body={
              <>
                Decryption is <span className="font-mono">O(B log B)</span>{" "}
                where B is the{" "}
                <strong>actual</strong> number of ciphertexts in the batch,
                not the maximum the system was provisioned for. Small batches
                cost proportionally less.
              </>
            }
          >
            <ScalingViz />
          </Property>
        </div>
      </div>
    </section>
  );
}
