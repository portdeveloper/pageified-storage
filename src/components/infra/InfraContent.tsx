"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import OraclePlayground from "./OraclePlayground";
import IndexerPlayground from "./IndexerPlayground";
import SwapPlayground from "./SwapPlayground";
import PaymentsPlayground from "./PaymentsPlayground";

interface Category {
  id: string;
  label: string;
  icon: string;
  ready: boolean;
}

const CATEGORIES: Category[] = [
  { id: "oracles", label: "Use an Oracle", icon: "◎", ready: true },
  { id: "indexers", label: "Index Events", icon: "⦿", ready: true },
  { id: "swaps", label: "Swap Tokens", icon: "⇄", ready: true },
  { id: "payments", label: "Accept Payments", icon: "◈", ready: true },
  { id: "bridges", label: "Bridge Assets", icon: "⌁", ready: false },
  { id: "rpcs", label: "Query an RPC", icon: "⟡", ready: false },
  { id: "auth", label: "Add Auth", icon: "⊡", ready: false },
];

export default function InfraContent() {
  const [active, setActive] = useState("oracles");

  return (
    <main className="min-h-screen flex flex-col items-center px-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl w-full text-center mt-20 sm:mt-28 mb-10"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.05] tracking-tight mb-5">
          I want to&hellip;
        </h1>
        <p className="text-base sm:text-lg text-text-secondary font-light max-w-md mx-auto leading-relaxed">
          Pick a tool, try it live, grab the code.
        </p>
      </motion.div>

      {/* Category picker */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl mb-10"
      >
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => cat.ready && setActive(cat.id)}
                disabled={!cat.ready}
                className={`
                  font-mono text-sm px-4 py-2.5 rounded-xl border transition-all duration-200
                  ${
                    isActive
                      ? "bg-text-primary text-surface border-text-primary"
                      : cat.ready
                      ? "bg-surface-elevated text-text-secondary border-border hover:border-text-tertiary hover:text-text-primary"
                      : "bg-surface text-text-tertiary/40 border-border/50 cursor-default"
                  }
                `}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
                {!cat.ready && (
                  <span className="ml-2 text-[10px] opacity-50">soon</span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Active playground */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mb-28"
      >
        {active === "oracles" && <OraclePlayground />}
        {active === "indexers" && <IndexerPlayground />}
        {active === "swaps" && <SwapPlayground />}
        {active === "payments" && <PaymentsPlayground />}
      </motion.div>
    </main>
  );
}
