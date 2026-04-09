"use client";

import { useInView } from "./useInView";
import { useLanguage } from "@/i18n/LanguageContext";

export default function CompatibilitySection() {
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
          {t("mip8.compatibility.title")}
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed">
          <p>
            {t("mip8.compatibility.desc1")}
          </p>
          <p>
            {t("mip8.compatibility.desc2")}
          </p>
        </div>

        {/* BLAKE3 footnote */}
        <div className="mt-10 p-4 bg-surface-elevated rounded-lg border border-border">
          <p className="text-sm text-text-secondary font-light leading-relaxed">
            {t("mip8.compatibility.blake3Note")}
          </p>
        </div>

      </div>
    </section>
  );
}
