"use client";

export default function FooterSection() {
  return (
    <footer className="py-16 px-6 bg-text-primary text-surface">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              Read the spec
            </p>
            <a
              href="https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-8.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface/80 hover:text-surface transition-colors underline underline-offset-4 decoration-surface/20 hover:decoration-surface/60"
            >
              MIP-8 on GitHub →
            </a>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              Join the discussion
            </p>
            <a
              href="https://forum.monad.xyz/t/mip-8-page-ified-storage-state/407"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface/80 hover:text-surface transition-colors underline underline-offset-4 decoration-surface/20 hover:decoration-surface/60"
            >
              Forum thread →
            </a>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              What&apos;s next
            </p>
            <p className="text-sm text-surface/60">
              MIP-9 is expected to build on this foundation with flexible
              fanout trees for smaller proofs and faster writes.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-surface/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-surface/30">
            An independent educational resource. Not affiliated with any project.
          </p>
          <p className="font-mono text-xs text-surface/30">
            CC0 · Public Domain
          </p>
        </div>
      </div>
    </footer>
  );
}
