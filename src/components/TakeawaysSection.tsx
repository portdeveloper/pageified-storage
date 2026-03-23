"use client";

import { motion } from "framer-motion";
import { useInView } from "./useInView";

const CARDS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Structs get cheaper",
    description:
      "Solidity packs struct fields into consecutive slots. Under MIP-8, reading a contiguous layout like a struct or array run often costs 1 cold page touch + N warm reads instead of N cold reads. These layouts benefit automatically; mapping-heavy access patterns mostly behave like they do today.",
    color: "text-solution-accent",
    bg: "bg-solution-bg",
    border: "border-solution-accent-light",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="8" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 15L21 9M11 17L21 23" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Mappings stay the same",
    description:
      "Mapping keys hash to random pages by design. MIP-8 doesn't make this worse — it just stops pretending sequential storage is random. Random access remains random; contiguous access is now recognized and rewarded.",
    color: "text-text-primary",
    bg: "bg-surface-elevated",
    border: "border-border",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 24V12L16 4L24 12V24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 28H28" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 24V18H19V24" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "New optimization patterns",
    description:
      "Page-aware arrays, assembly-level tricks for packing related data into the same 128-slot page. A new design space opens for gas optimization that aligns with how your hardware actually works.",
    color: "text-solution-accent",
    bg: "bg-solution-bg",
    border: "border-solution-accent-light",
  },
];

export default function TakeawaysSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-solution-bg relative">
      <div
        className={`max-w-4xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-solution-muted uppercase mb-3">
          For developers
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-10">
          What this means for you
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`${card.bg} rounded-xl border ${card.border} p-6 flex flex-col`}
            >
              <div className={`${card.color} mb-4`}>{card.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-text-secondary font-light leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
