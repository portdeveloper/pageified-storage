"use client";

import { motion } from "framer-motion";
import { useExplainMode, type ExplainMode } from "./ExplainModeContext";

const MODES: { key: ExplainMode; label: string; badge?: string }[] = [
  { key: "technical", label: "Technical" },
  { key: "simple", label: "Simple", badge: "beta" },
];

export default function ModeToggle() {
  const { mode, toggle } = useExplainMode();

  return (
    <div className="sticky top-12 z-40 bg-surface/90 backdrop-blur-sm border-b border-border">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-center h-10">
        <div className="relative flex items-center bg-surface-elevated rounded-lg border border-border p-0.5">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => mode !== m.key && toggle()}
              className="relative font-mono text-xs px-5 py-1.5 rounded-md transition-colors cursor-pointer z-10"
              style={{
                color: mode === m.key ? "var(--color-surface)" : "var(--color-text-secondary)",
              }}
            >
              {mode === m.key && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-text-primary rounded-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">
                {m.label}
                {m.badge && (
                  <span className="ml-1 text-[9px] opacity-50">{m.badge}</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
