"use client";

import { useInView } from "./useInView";

export default function CompatibilitySection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-3xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-text-tertiary uppercase mb-3">
          Compatibility
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
          Execution stays compatible
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed">
          <p>
            At the opcode level, execution semantics stay the same: <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">SLOAD</span> still
            returns 32 bytes and <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">SSTORE</span> still writes
            32 bytes. What changes is the storage commitment/proof layer and the
            gas model, which become page-aware. The effective key space narrows
            from 2<sup>256</sup> hashed slots to 2<sup>249</sup> page indices.
          </p>
          <p>
            Contracts that read consecutive storage slots often get cheaper
            because Solidity stores struct members, fixed arrays, and runs of
            dynamic-array elements contiguously once their base location is
            known. Mappings still use hashed locations, so mapping-heavy access
            patterns tend to change less. The main contracts at risk are those
            that hardcode opcode-gas assumptions for consecutive storage
            accesses.
          </p>
        </div>

        {/* BLAKE3 footnote */}
        <div className="mt-10 p-4 bg-surface-elevated rounded-lg border border-border">
          <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-2">
            Under the hood
          </p>
          <p className="text-sm text-text-secondary font-light leading-relaxed">
            Each 4,096-byte page is committed via a fixed binary tree built from
            the BLAKE3 compression function. 128 slots pair into 64 leaves,
            which hash through 6 levels into a single 32-byte root. An inclusion
            proof for any slot is about 257 bytes (1-byte index + target word +
            sibling word + 6 parent hashes), plus the MPT proof for the page
            commitment.
          </p>
        </div>

        {/* Visual separator */}
        <div className="mt-16 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <p className="font-mono text-xs text-text-tertiary">
            MIP-8 · Page-ified Storage State
          </p>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>
    </section>
  );
}
