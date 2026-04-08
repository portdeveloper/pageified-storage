"use client";

import { useInView } from "../useInView";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Mip3CompatibilitySection() {
  const { t } = useLanguage();
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
          {t("mip3.compatibility.title")}
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed">
          <p>
            {t("mip3.compatibility.desc1")}
          </p>
          <p>
            {t("mip3.compatibility.desc2")}
          </p>
          <p>
            {t("mip3.compatibility.desc3")}
          </p>
        </div>

        {/* Affected opcodes */}
        <div className="mt-10 p-4 bg-surface-elevated rounded-lg border border-border">
          <p className="font-mono text-xs text-text-tertiary mb-3">
            {t("mip3.compatibility.opcodeNote")}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "MLOAD", "MSTORE", "MSTORE8", "MCOPY",
              "KECCAK256",
              "CALLDATACOPY", "CODECOPY", "RETURNDATACOPY", "EXTCODECOPY",
              "LOG0-LOG4",
              "CREATE", "CREATE2",
              "CALL", "CALLCODE", "DELEGATECALL", "STATICCALL",
              "RETURN", "REVERT",
            ].map((op) => (
              <span
                key={op}
                className="font-mono text-xs px-2 py-1 bg-surface rounded border border-border text-text-secondary"
              >
                {op}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
