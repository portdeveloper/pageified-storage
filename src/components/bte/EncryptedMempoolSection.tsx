"use client";

import { motion } from "framer-motion";
import { useInView } from "../useInView";

interface ApproachCardProps {
  name: string;
  idea: string;
  problem: string;
  tone: "warn" | "bad";
}

function ApproachCard({ name, idea, problem, tone }: ApproachCardProps) {
  const color = tone === "bad" ? "#c4653a" : "#a8856e";
  return (
    <div className="bg-surface-elevated rounded-xl border border-border p-5">
      <p
        className="font-mono text-[11px] font-semibold tracking-wider uppercase mb-2"
        style={{ color }}
      >
        {name}
      </p>
      <p className="text-sm text-text-primary leading-relaxed mb-3">{idea}</p>
      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-border">
        <span
          className="font-mono text-[10px] mt-0.5 shrink-0"
          style={{ color }}
        >
          ✗
        </span>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {problem}
        </p>
      </div>
    </div>
  );
}

export default function EncryptedMempoolSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section id="the-problem" ref={ref} className="py-24 px-6 bg-surface scroll-mt-16">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase mb-3">
          The problem
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Why encrypted mempools are hard
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          When a transaction is submitted, it sits pending in the mempool
          where anyone can see it and front-run it. The clean fix is to
          encrypt transactions until they land in a block. But doing that
          efficiently has been an open problem for years — every prior
          approach trades off in a way that breaks the design.
        </p>

        {/* What we actually want */}
        <div className="bg-solution-bg rounded-xl border border-solution-cell p-6 mb-10">
          <p className="font-mono text-xs text-solution-accent uppercase tracking-wider mb-3">
            What we want
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Wanted
              step="1"
              title="User encrypts"
              body="Transaction goes into the mempool as ciphertext. No one can read it."
            />
            <Wanted
              step="2"
              title="Block builder picks a batch"
              body="Only the transactions landing in the block are designated for decryption."
            />
            <Wanted
              step="3"
              title="Committee jointly decrypts"
              body="A threshold of validators opens exactly that batch. Everything else stays private for the next block."
            />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">
          Why naïve approaches don&apos;t work
        </h3>
        <p className="text-base text-text-secondary font-light max-w-3xl leading-relaxed mb-6">
          Cryptographers have tried several routes. Each one has a flaw that
          an encrypted mempool can&apos;t tolerate.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ApproachCard
            name="Naïve threshold encryption"
            idea="Every validator holds a share of the decryption key. To decrypt a batch of B transactions with N validators, they all send shares."
            problem="Communication scales as O(N · B). With hundreds of validators and thousands of transactions per block, this is prohibitive."
            tone="bad"
          />
          <ApproachCard
            name="Threshold identity-based encryption (IBE)"
            idea="Encrypt to an epoch label. At the end of the epoch, validators release one small decryption key for that epoch."
            problem="All-or-nothing. Releasing the epoch key decrypts every ciphertext in the epoch — including the ones that weren't included in any block. No selective privacy."
            tone="bad"
          />
          <ApproachCard
            name="Early batched threshold encryption"
            idea="The committee runs a fresh setup protocol for each block, then uses it to decrypt exactly that block's batch."
            problem="A full MPC-based setup ceremony every single block is far too slow to keep up with block times."
            tone="bad"
          />
          <ApproachCard
            name="Indexed BTE (BEAT-MEV, BEAT++)"
            idea="Users pick an index from a small namespace when they encrypt. Each block's committee decrypts at most one ciphertext per index."
            problem="Two honest users can collide on the same index. And worse — an attacker can censor a target by publishing a ciphertext with the same index."
            tone="bad"
          />
          <ApproachCard
            name="TrX (Fernando et al.)"
            idea="Collision-free and epochless, fixing the indexed-BTE problems."
            problem="Needs a common reference string that grows with the number of decryption sessions. For a long-lived chain, the CRS grows without bound."
            tone="warn"
          />
          <ApproachCard
            name="PFE (Boneh et al.)"
            idea="Collision-free, epochless, constant-size CRS. Uses partial-fraction techniques."
            problem="Works, but the concrete computation is expensive. And the ciphertext is still 3 group elements."
            tone="warn"
          />
        </div>

        <div className="bg-surface-elevated rounded-xl border-2 border-solution-accent/30 p-6">
          <p className="font-mono text-xs text-solution-accent uppercase tracking-wider mb-2">
            BTX fills the gap
          </p>
          <p className="text-base text-text-primary leading-relaxed">
            BTX is the first BTE scheme that is <strong>simultaneously</strong>{" "}
            collision-free, epochless, compact (ciphertext as small as plain
            ElGamal), and fast (decryption scales with the{" "}
            <em>actual</em> batch size, not the maximum).
          </p>
        </div>
      </div>
    </section>
  );
}

function Wanted({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: Number(step) * 0.08 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-mono text-[10px] w-5 h-5 rounded-full bg-solution-accent text-white flex items-center justify-center font-semibold">
          {step}
        </span>
        <p className="font-mono text-xs text-solution-accent font-semibold">
          {title}
        </p>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
    </motion.div>
  );
}
