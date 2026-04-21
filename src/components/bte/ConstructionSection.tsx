"use client";

import { motion } from "framer-motion";
import { useInView } from "../useInView";
import { Card } from "../ui/Card";

export default function ConstructionSection() {
  const { ref, isVisible } = useInView(0.1);
  return (
    <section ref={ref} className="py-24 px-6 bg-surface-elevated border-y border-border">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          The construction, at a glance
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          BTX builds on pairing-friendly elliptic curves (BLS12-381 in the
          implementation). Everything below is deliberately a sketch — the
          paper has the full protocol, proofs, and security reductions.
        </p>

        {/* Ciphertext structure */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <div className="md:col-span-2">
            <p className="font-mono text-[11px] text-solution-accent uppercase tracking-wider font-semibold mb-2">
              1. Encryption
            </p>
            <h3 className="text-lg font-semibold mb-2">
              An ElGamal-shaped ciphertext
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-2">
              To encrypt a message m, the sender picks a random r and outputs
              a pair. The second component masks m with a pad derived from
              the public encryption key.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              That&apos;s it. No index, no epoch tag, no batch coordination.
            </p>
          </div>
          <div className="md:col-span-3">
            <Card tone="flat" className="font-mono text-sm">
              <p className="text-[11px] text-text-tertiary uppercase tracking-wider mb-3">
                Ciphertext
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-text-secondary">ct =</span>
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-user-bg text-user-accent font-semibold px-3 py-1.5 rounded-lg"
                >
                  [r]₁
                </motion.span>
                <span className="text-text-tertiary">,</span>
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="bg-solution-accent-light text-solution-accent font-semibold px-3 py-1.5 rounded-lg"
                >
                  m + r · ek
                </motion.span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-[11px] text-user-accent font-semibold mb-0.5">
                    [r]₁
                  </p>
                  <p className="text-[11px] text-text-tertiary leading-snug">
                    the randomness in G₁
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-solution-accent font-semibold mb-0.5">
                    m + r · ek
                  </p>
                  <p className="text-[11px] text-text-tertiary leading-snug">
                    the masked message in G_T
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-text-tertiary mt-4">
                Core size: |G₁| + |G_T| — same as standard ElGamal. A short
                Schnorr NIZK proof rides alongside for CCA security.
              </p>
            </Card>
          </div>
        </div>

        {/* Committee flow */}
        <div className="mb-10">
          <p className="font-mono text-[11px] text-solution-accent uppercase tracking-wider font-semibold mb-2">
            2. Committee decryption
          </p>
          <h3 className="text-lg font-semibold mb-2">
            One G₁ element per server, regardless of batch size
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl mb-6">
            The powers of the secret key τ are Shamir-shared across N
            servers. Any t + 1 of them can collectively decrypt a batch. Crucially, each server
            sends exactly <strong>one group element</strong> to the combiner —
            the server&apos;s message size doesn&apos;t depend on how large
            the batch is.
          </p>

          <CommitteeFlowDiagram />
        </div>

        {/* The FFT trick */}
        <Card tone="solution">
          <p className="font-mono text-[11px] text-solution-accent uppercase tracking-wider font-semibold mb-2">
            3. The speed trick
          </p>
          <h3 className="text-lg font-semibold mb-3">
            Batch decryption as a polynomial product
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl mb-4">
            The naïve version of batch decryption costs{" "}
            <span className="font-mono">O(B²)</span> pairings because every
            ciphertext contributes a cross-term to every other. BTX observes
            that these cross-terms form a{" "}
            <em>contiguous window of a polynomial product</em>. Computing
            them reduces to a middle-product that can be evaluated with FFT,
            giving <span className="font-mono">O(B log B)</span> group
            operations and <span className="font-mono">O(B)</span> pairings.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Because the FFT size adapts to the actual batch, smaller batches
            finish proportionally faster — you only pay for the ciphertexts
            you&apos;re actually decrypting.
          </p>
        </Card>
      </div>
    </section>
  );
}

function CommitteeFlowDiagram() {
  const servers = [0, 1, 2, 3, 4];

  return (
    <Card tone="flat">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Ciphertexts */}
        <div>
          <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
            Ciphertexts in batch
          </p>
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-surface-elevated rounded border border-border px-3 py-1.5 font-mono text-xs text-text-secondary flex items-center gap-2"
              >
                <span className="text-solution-accent">ct</span>
                <span className="text-text-tertiary">#{i + 1}</span>
              </motion.div>
            ))}
            <p className="font-mono text-[10px] text-text-tertiary text-center">
              …
            </p>
          </div>
        </div>

        {/* Servers */}
        <div>
          <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
            Committee (N servers)
          </p>
          <div className="space-y-2">
            {servers.map((s) => (
              <motion.div
                key={s}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + s * 0.06 }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-solution-accent shrink-0" />
                <span className="font-mono text-[11px] text-text-secondary">
                  server {s + 1}
                </span>
                <span className="text-text-tertiary text-xs">→</span>
                <span className="font-mono text-[10px] text-solution-accent bg-solution-accent-light rounded px-1.5 py-0.5">
                  σ<sub>{s + 1}</sub> (1 G₁ element)
                </span>
              </motion.div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-text-tertiary mt-3 leading-relaxed">
            Any t+1 shares reconstruct the batch secret key σ.
          </p>
        </div>

        {/* Output */}
        <div>
          <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mb-2">
            Combiner output
          </p>
          <div className="space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="bg-solution-accent-light rounded border border-solution-accent/30 px-3 py-1.5 font-mono text-xs text-solution-accent flex items-center gap-2"
              >
                <CheckMini />
                <span>m<sub>{i + 1}</sub></span>
              </motion.div>
            ))}
            <p className="font-mono text-[10px] text-text-tertiary text-center">
              …
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CheckMini() {
  return (
    <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 5"
        stroke="#2a7d6a"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
