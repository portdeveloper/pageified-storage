"use client";

import { useInView } from "../useInView";

export default function Mip3CompatibilitySection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
          Backwards compatible
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed">
          <p>
            All memory opcodes work identically: <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">MLOAD</span>,{" "}
            <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">MSTORE</span>,{" "}
            <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">MSTORE8</span>,{" "}
            <span className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">MCOPY</span>.
            Only the gas cost of expansion changes.
          </p>
          <p>
            Existing contracts get cheaper, not broken. Average memory usage is
            around 2 KB, which drops from 198 gas to 32 gas. The only contracts
            at risk are those hardcoding gas assumptions about memory expansion costs.
          </p>
          <p>
            When the 8 MB limit is exceeded, the call reverts (returning unspent
            gas to the parent), rather than causing an exceptional halt. This
            preserves compatibility with ERC-4337 bundlers that catch reverts.
          </p>
        </div>

        {/* Affected opcodes */}
        <div className="mt-10 p-4 bg-surface-elevated rounded-lg border border-border">
          <p className="font-mono text-xs text-text-tertiary mb-3">
            All memory-expanding opcodes use the new linear cost:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "MLOAD", "MSTORE", "MSTORE8", "MCOPY",
              "KECCAK256",
              "CALLDATACOPY", "CODECOPY", "RETURNDATACOPY", "EXTCODECOPY",
              "LOG0-LOG4",
              "CREATE", "CREATE2",
              "CALL", "CALLCODE", "DELEGATECALL", "STATICCALL",
              "RETURN", "REVERT",
            ].map((op) => (
              <span
                key={op}
                className="font-mono text-xs px-2 py-1 bg-surface rounded border border-border text-text-secondary"
              >
                {op}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
