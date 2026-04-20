"use client";

import { useInView } from "../useInView";

const AUTHORS = [
  "Amit Agarwal",
  "Sourav Das",
  "Babak Poorebrahim Gilkalaye",
  "Peter Rindal",
  "Victor Shoup",
];

const RELATED = [
  {
    title: "Weighted batched threshold encryption",
    authors: "Agarwal et al. (BEAT++)",
    venue: "ePrint 2025/2115",
    href: "https://eprint.iacr.org/2025/2115",
  },
  {
    title: "TrX: Encrypted mempools in high-performance BFT protocols",
    authors: "Fernando, Polidharla, Tonkikh, Xiang",
    venue: "ePrint 2025/2032",
    href: "https://eprint.iacr.org/2025/2032",
  },
  {
    title: "Efficient batch threshold encryption using partial fraction techniques",
    authors: "Boneh, Nema, Roy, Tas (PFE)",
    venue: "Cryptology ePrint Archive, 2026",
    href: "https://eprint.iacr.org/",
  },
];

export default function BteFooterSection() {
  const { ref, isVisible } = useInView(0.1);
  return (
    <section ref={ref} className="py-24 px-6 bg-surface-elevated border-t border-border">
      <div
        className={`max-w-4xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase mb-3">
          The paper
        </p>
        <h2 className="text-3xl font-semibold tracking-tight mb-4">
          BTX: Simple and Efficient Batch Threshold Encryption
        </h2>
        <p className="text-sm text-text-secondary mb-5">
          {AUTHORS.join(" · ")} — Category Labs
        </p>

        <a
          href="https://category-labs.github.io/category-research/BTX-paper.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-text-primary text-surface px-4 py-2.5 rounded-lg font-mono text-xs hover:bg-text-secondary transition-colors"
        >
          Read the paper (PDF)
          <svg
            viewBox="0 0 24 24"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>

        <div className="mt-12">
          <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase mb-4">
            Related work cited by BTX
          </p>
          <div className="space-y-3">
            {RELATED.map((r) => (
              <a
                key={r.title}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface rounded-lg border border-border hover:border-text-tertiary/40 transition-colors p-4"
              >
                <p className="font-semibold text-sm mb-1">{r.title}</p>
                <p className="font-mono text-[11px] text-text-tertiary">
                  {r.authors} · {r.venue}
                </p>
              </a>
            ))}
          </div>
        </div>

        <p className="font-mono text-[11px] text-text-tertiary mt-12 leading-relaxed">
          This page is an interactive summary maintained by MIP Land. For
          formal definitions, security proofs, and the complete
          construction, read the paper. BTX is Category Labs research, not a
          Monad Improvement Proposal.
        </p>
      </div>
    </section>
  );
}
