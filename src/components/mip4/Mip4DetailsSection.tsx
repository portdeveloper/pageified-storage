"use client";

import { useInView } from "../useInView";

export default function Mip4DetailsSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
          Technical details
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed mb-10">
          <p>
            The precompile lives at{" "}
            <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              0x1001
            </code>{" "}
            with a single method:{" "}
            <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              dippedIntoReserve()
            </code>{" "}
            (selector{" "}
            <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              0x3a61584e
            </code>
            ). It costs 100 gas, equivalent to a transient storage read.
          </p>
          <p>
            The check is global: it evaluates all accounts touched in the
            transaction, not just the caller&apos;s. It returns true if any
            account&apos;s balance is currently below its reserve threshold;
            it clears back to false if that balance recovers above the
            threshold mid-transaction.
          </p>
        </div>

        {/* Key rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-elevated rounded-xl border border-border p-5">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
              Call restrictions
            </p>
            <ul className="space-y-2 text-sm text-text-secondary font-light">
              <li className="flex items-start gap-2">
                <span className="text-solution-accent mt-0.5">&#10003;</span>
                <span>
                  <code className="font-mono text-xs bg-surface px-1 rounded">CALL</code> works
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-problem-accent mt-0.5">&#10007;</span>
                <span>
                  <code className="font-mono text-xs bg-surface px-1 rounded">STATICCALL</code>,{" "}
                  <code className="font-mono text-xs bg-surface px-1 rounded">DELEGATECALL</code>,{" "}
                  <code className="font-mono text-xs bg-surface px-1 rounded">CALLCODE</code>{" "}
                  revert
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-problem-accent mt-0.5">&#10007;</span>
                <span>Nonzero value reverts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-problem-accent mt-0.5">&#10007;</span>
                <span>Extra calldata beyond the 4-byte selector reverts</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-elevated rounded-xl border border-border p-5">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
              Important behaviors
            </p>
            <ul className="space-y-2 text-sm text-text-secondary font-light">
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span>
                  Reverts consume <strong>all gas</strong> (precompile behavior, not Solidity-style refund)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span>
                  Smart contracts (non-EIP-7702) are <strong>exempt</strong> from reserve balance
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span>
                  <strong>Emptying exception:</strong> an undelegated EOA&apos;s first transaction in k blocks may spend below reserve, letting users fully withdraw. EIP-7702-delegated accounts cannot use this exception.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span>
                  O(1) cost: tracks violations incrementally via a failed-address set
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code example */}
        <div className="bg-surface-elevated rounded-xl border border-border p-5">
          <p className="font-mono text-xs text-text-tertiary mb-3">
            Usage in Solidity
          </p>
          <pre className="font-mono text-sm text-text-primary leading-relaxed overflow-x-auto">
{`interface IReserveBalance {
    function dippedIntoReserve() external returns (bool);
}

// Call the precompile at 0x1001
IReserveBalance reserve = IReserveBalance(address(0x1001));

// After a risky operation:
if (reserve.dippedIntoReserve()) {
    // Some account dropped below 10 MON reserve
    // Revert, adjust, or take alternate path
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
