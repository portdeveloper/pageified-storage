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
          Nothing breaks
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed">
          <p>
            EVM semantics are effectively unchanged. Only gas costs change.
            Every existing opcode works exactly as before — <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">SLOAD</span> still
            returns 32 bytes, <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">SSTORE</span> still
            writes 32 bytes. The effective key space narrows from 2<sup>256</sup> to
            2<sup>249</sup> pages, but collision probability remains
            astronomically low.
          </p>
          <p>
            Contracts that read consecutive storage slots often get cheaper
            automatically because Solidity already lays out structs, state
            variables, and array elements contiguously. Mapping-heavy access
            patterns mostly behave like they do today. The main contracts
            affected negatively are those that hardcode specific gas values for
            opcodes — a pattern that&apos;s already discouraged.
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
