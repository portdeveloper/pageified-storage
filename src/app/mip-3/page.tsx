import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MIP-3: Linear Memory",
  description:
    "An interactive explainer for MIP-3: linear memory costs on Monad",
};

export default function Mip3Page() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight mb-4">
          MIP-3: Linear Memory
        </h1>
        <p className="text-lg text-text-secondary font-light mb-6">
          Interactive explainer coming soon.
        </p>
        <a
          href="https://monad-crypto.github.io/MIPs/MIPS/MIP-3"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-text-tertiary hover:text-text-primary underline underline-offset-4 transition-colors"
        >
          Read the spec →
        </a>
      </div>
    </main>
  );
}
