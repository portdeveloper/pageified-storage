import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MIP Land — Interactive Monad Improvement Proposals",
  description:
    "Interactive explainers for Monad Improvement Proposals. Understand MIPs through visualizations, not just specs.",
  openGraph: {
    title: "MIP Land — Interactive Monad Improvement Proposals",
    description:
      "Interactive explainers for Monad Improvement Proposals. Understand MIPs through visualizations, not just specs.",
  },
};

const MIPS = [
  {
    id: "MIP-8",
    href: "/mip-8",
    title: "Page-ified Storage",
    description:
      "Aligning EVM storage with hardware reality. See how 4 KB page-aligned reads cut random I/O and reshape gas costs.",
    accent: "solution",
  },
  {
    id: "MIP-3",
    href: "/mip-3",
    title: "Linear Memory",
    description:
      "Replacing quadratic memory costs with a linear model and a shared 8 MB pool. Watch the cost curve flatten.",
    accent: "problem",
    beta: true,
  },
  {
    id: "MIP-4",
    href: "/mip-4",
    title: "Reserve Balance Introspection",
    description:
      "Letting contracts detect when an account dips below the 10 MON reserve threshold mid-execution.",
    accent: "solution",
    beta: true,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-[85vh] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center mt-24 mb-16">
        <h1 className="text-4xl sm:text-5xl font-light leading-[1.1] tracking-tight mb-4">
          MIP Land
        </h1>
        <p className="text-lg text-text-secondary font-light max-w-md mx-auto leading-relaxed">
          Interactive explainers for Monad Improvement Proposals.
          Understand MIPs through visualizations, not just specs.
        </p>
      </div>

      <div className="max-w-2xl w-full grid gap-4 mb-24">
        {MIPS.map((mip) => (
          <Link
            key={mip.id}
            href={mip.href}
            className="group block bg-surface-elevated rounded-xl p-6 border border-border hover:border-text-tertiary/30 transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono text-xs text-text-tertiary tracking-wider">
                {mip.id}
              </span>
              {mip.beta && (
                <span className="font-mono text-[10px] text-text-tertiary bg-surface px-2 py-0.5 rounded-full">
                  beta
                </span>
              )}
            </div>
            <h2 className="text-xl font-medium mb-2 group-hover:text-solution-accent transition-colors">
              {mip.title}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {mip.description}
            </p>
            <span className="inline-block mt-3 font-mono text-xs text-text-tertiary group-hover:text-text-secondary transition-colors">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
