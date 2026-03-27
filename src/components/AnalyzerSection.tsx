"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "./useInView";

export default function AnalyzerSection() {
  const { ref, isVisible } = useInView(0.1);
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleAnalyze = () => {
    if (!input.trim()) return;
    router.push(`/analyzer?q=${encodeURIComponent(input.trim())}`);
  };

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-elevated relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Try your own contract
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-8">
          Paste a GitHub repo URL or Solidity source to see how your
          contract&apos;s storage layout maps to pages.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="https://github.com/Uniswap/v2-core"
            className="flex-1 font-mono text-xs bg-surface border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-text-secondary"
          />
          <button
            onClick={handleAnalyze}
            disabled={!input.trim()}
            className={`font-mono text-xs px-5 py-3 rounded-lg border transition-all shrink-0 ${
              !input.trim()
                ? "bg-surface border-border text-text-tertiary cursor-default"
                : "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
            }`}
          >
            Analyze
          </button>
        </div>
      </div>
    </section>
  );
}
