"use client";

export default function SpamFooterSection() {
  return (
    <footer className="py-16 px-6 bg-text-primary text-surface">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              Read the paper
            </p>
            <a
              href="https://arxiv.org/abs/2604.00234"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface/80 hover:text-surface transition-colors underline underline-offset-4 decoration-surface/20 hover:decoration-surface/60"
            >
              Blockspace Under Pressure: An Analysis of Spam MEV on
              High-Throughput Blockchains &rarr;
            </a>
            <p className="text-xs text-surface/40 mt-2">
              Category Labs, 2025
            </p>
          </div>
          <div>
            <p className="font-mono text-xs tracking-wider uppercase text-surface/50 mb-3">
              About
            </p>
            <p className="text-sm text-surface/60">
              This interactive explainer visualizes the equilibrium model
              from the paper. All parameters use the paper&apos;s defaults.
              The PFO effect uses a simplified approximation; see the paper
              for the full sub-block model.
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
