"use client";

import { motion } from "framer-motion";
import { useExplainMode } from "./ExplainModeContext";

export default function ModeToggle() {
  const { mode, toggle } = useExplainMode();
  const isSimple = mode === "simple";

  const containerClasses = isSimple
    ? "bg-surface-elevated border border-border"
    : "bg-solution-accent border border-solution-accent";
  const labelClasses = isSimple
    ? "text-text-primary font-semibold"
    : "text-surface font-semibold";
  const trackClasses = isSimple ? "bg-text-primary" : "bg-surface/40";

  return (
    <button
      onClick={toggle}
      aria-label={isSimple ? "Switch to technical mode" : "Switch to ELI5 mode"}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 font-mono text-xs cursor-pointer select-none rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all ${containerClasses}`}
    >
      <span className={`transition-colors ${labelClasses}`}>
        Explain Like I&apos;m 5
      </span>
      <div className={`relative w-8 h-[18px] rounded-full transition-colors ${trackClasses}`}>
        <motion.div
          className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-surface shadow-sm"
          animate={{ left: isSimple ? 14 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}
