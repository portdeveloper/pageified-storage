"use client";

import { motion } from "framer-motion";
import { useInView } from "../useInView";
import { useLanguage } from "@/i18n/LanguageContext";

// A sampling of selector slots to show in the table (abbreviated view)
const SAMPLE_SELECTORS = Array.from({ length: 32 }, (_, i) => i);

export default function NamespaceSection() {
  const { t } = useLanguage();
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          {t("mip7.namespace.title")}
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          {t("mip7.namespace.desc")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Two-level decode diagram */}
          <div className="bg-surface-elevated rounded-xl border border-border p-6">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-6">
              {t("mip7.namespace.twoByteDispatch")}
            </p>

            {/* Byte 1 */}
            <div className="mb-6">
              <p className="font-mono text-[10px] text-text-tertiary mb-2">
                {t("mip7.namespace.byte1")}
              </p>
              <div className="flex items-center gap-3">
                <div className="font-mono text-lg font-semibold px-4 py-2.5 rounded-lg bg-solution-accent text-white">
                  0xAE
                </div>
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold text-solution-accent">
                    EXTENSION
                  </p>
                  <p className="font-mono text-xs text-text-tertiary mt-0.5">
                    {t("mip7.namespace.reservedBy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-border" />
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-border shrink-0"
              >
                <path
                  d="M2 6h8M6 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="font-mono text-[10px] text-text-tertiary">
                {t("mip7.namespace.dispatchOnSelector")}
              </p>
            </div>

            {/* Byte 2 */}
            <div>
              <p className="font-mono text-[10px] text-text-tertiary mb-2">
                {t("mip7.namespace.byte2")}
              </p>
              <div className="space-y-2">
                {[
                  { sel: "0x00", label: "unassigned → INVALID", future: false },
                  { sel: "0x01", label: "unassigned → INVALID", future: false },
                  { sel: "...", label: "unassigned → INVALID", future: false },
                  { sel: "0xFF", label: "unassigned → INVALID", future: false },
                ].map((row) => (
                  <div key={row.sel} className="flex items-center gap-3">
                    <div className="font-mono text-xs px-2 py-1 rounded bg-solution-cell text-solution-muted w-12 text-center shrink-0">
                      {row.sel}
                    </div>
                    <p className="font-mono text-xs text-text-tertiary">
                      {row.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chain behavior comparison */}
          <div className="space-y-4">
            <div className="bg-surface-elevated rounded-xl border border-border p-6">
              <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-4">
                {t("mip7.namespace.onEthereumL1")}
              </p>
              <div className="font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-problem-accent">0xAE</span>
                  <span className="text-text-tertiary">→</span>
                  <span className="text-text-secondary">
                    INVALID · halt · all gas consumed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-problem-accent">0xAE 0x01</span>
                  <span className="text-text-tertiary">→</span>
                  <span className="text-text-secondary">
                    INVALID (same)
                  </span>
                </div>
              </div>
              <p className="font-mono text-xs text-text-tertiary mt-4">
                {t("mip7.namespace.ethNote")}
              </p>
            </div>

            <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-6">
              <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-4">
                {t("mip7.namespace.onMonad")}
              </p>
              <div className="font-mono text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-solution-accent">0xAE 0x00</span>
                  <span className="text-text-tertiary">→</span>
                  <span className="text-text-secondary">
                    INVALID (today)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-solution-accent">0xAE 0x01</span>
                  <span className="text-text-tertiary">→</span>
                  <span className="text-text-secondary">
                    future MIP assigns this
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-solution-accent">0xAE XX</span>
                  <span className="text-text-tertiary">→</span>
                  <span className="text-text-secondary">
                    dispatch to selector XX
                  </span>
                </div>
              </div>
              <p className="font-mono text-xs text-solution-muted mt-4">
                {t("mip7.namespace.monadNote")}
              </p>
            </div>
          </div>
        </div>

        {/* Selector grid preview */}
        <div className="bg-surface-elevated rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-text-tertiary">
              {t("mip7.namespace.selectorTable")}
            </p>
            <p className="font-mono text-xs text-text-tertiary">
              {t("mip7.namespace.statusAll")}
            </p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SAMPLE_SELECTORS.map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="rounded-md bg-solution-cell px-2 py-1.5 text-center"
              >
                <p className="font-mono text-[10px] text-solution-muted">
                  0x{i.toString(16).toUpperCase().padStart(2, "0")}
                </p>
                <p className="font-mono text-[9px] text-text-tertiary mt-0.5">
                  INVALID
                </p>
              </motion.div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-text-tertiary mt-3">
            {t("mip7.namespace.moreSelectors")}
          </p>
        </div>
      </div>
    </section>
  );
}
