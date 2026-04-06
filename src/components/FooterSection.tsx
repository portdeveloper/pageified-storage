"use client";

import { usePathname } from "next/navigation";

const FOOTER_DATA: Record<string, { specUrl: string; specLabel: string; note: string }> = {
  "/mip-8": {
    specUrl: "https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-8.md",
    specLabel: "MIP-8 on GitHub",
    note: "MIP-8's future-directions section points to MIP-9 as a possible follow-on exploring flexible fanout trees for smaller proofs and optimized storage writes.",
  },
  "/mip-3": {
    specUrl: "https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-3.md",
    specLabel: "MIP-3 on GitHub",
    note: "MIP-3 shipped as part of the MONAD_NINE network upgrade. It replaces the quadratic memory cost model with a linear one and introduces a shared 8 MB memory pool.",
  },
  "/mip-4": {
    specUrl: "https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-4.md",
    specLabel: "MIP-4 on GitHub",
    note: "MIP-4 shipped as part of the MONAD_NINE network upgrade. The precompile at 0x1001 lets contracts detect reserve balance violations mid-execution.",
  },
  "/mip-7": {
    specUrl: "https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-7.md",
    specLabel: "MIP-7 on GitHub",
    note: "MIP-7 aligns with EIP-8163, which reserves 0xAE on Ethereum L1 for non-L1 extension use. All 256 selectors are currently unassigned; future MIPs will claim specific slots.",
  },
};

export default function FooterSection() {
  const pathname = usePathname();
  const data = FOOTER_DATA[pathname] || FOOTER_DATA["/mip-8"];

  return (
    <footer className="py-16 px-6 bg-text-primary text-surface">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              Read the spec
            </p>
            <a
              href={data.specUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface/80 hover:text-surface transition-colors underline underline-offset-4 decoration-surface/20 hover:decoration-surface/60"
            >
              {data.specLabel} →
            </a>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              About
            </p>
            <p className="text-sm text-surface/60">
              {data.note}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-surface/10 flex items-center justify-center">
          <p className="font-mono text-xs text-surface/30">
            made by{" "}
            <a
              href="https://x.com/port_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-surface/50 hover:text-surface transition-colors underline underline-offset-2"
            >
              port
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
