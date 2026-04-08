"use client";

import { useInView } from "../useInView";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Mip4DetailsSection() {
  const { ref, isVisible } = useInView(0.1);
  const { t } = useLanguage();

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-6">
          {t("mip4.details.title")}
        </h2>
        <div className="space-y-4 text-lg text-text-secondary font-light leading-relaxed mb-10">
          <p>
            {t("mip4.details.desc1").split("0x1001")[0]}
            <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              0x1001
            </code>
            {t("mip4.details.desc1").split("0x1001")[1].split("dippedIntoReserve()")[0]}
            <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              dippedIntoReserve()
            </code>
            {t("mip4.details.desc1").split("dippedIntoReserve()")[1].split("0x3a61584e")[0]}
            <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
              0x3a61584e
            </code>
            {t("mip4.details.desc1").split("0x3a61584e")[1]}
          </p>
          <p>
            {t("mip4.details.desc2")}
          </p>
        </div>

        {/* Key rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-elevated rounded-xl border border-border p-5">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
              {t("mip4.details.callRestrictions")}
            </p>
            <ul className="space-y-2 text-sm text-text-secondary font-light">
              <li className="flex items-start gap-2">
                <span className="text-solution-accent mt-0.5">&#10003;</span>
                <span>
                  <code className="font-mono text-xs bg-surface px-1 rounded">CALL</code>{" "}
                  {t("mip4.details.callWorks").replace("CALL ", "")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-problem-accent mt-0.5">&#10007;</span>
                <span>
                  <code className="font-mono text-xs bg-surface px-1 rounded">STATICCALL</code>,{" "}
                  <code className="font-mono text-xs bg-surface px-1 rounded">DELEGATECALL</code>,{" "}
                  <code className="font-mono text-xs bg-surface px-1 rounded">CALLCODE</code>{" "}
                  {t("mip4.details.callReverts").replace("STATICCALL, DELEGATECALL, CALLCODE ", "")}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-problem-accent mt-0.5">&#10007;</span>
                <span>{t("mip4.details.nonzeroReverts")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-problem-accent mt-0.5">&#10007;</span>
                <span>{t("mip4.details.extraCalldata")}</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-elevated rounded-xl border border-border p-5">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
              {t("mip4.details.importantBehaviors")}
            </p>
            <ul className="space-y-2 text-sm text-text-secondary font-light">
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span dangerouslySetInnerHTML={{ __html: t("mip4.details.allGas").replace("all gas", "<strong>all gas</strong>") }} />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span dangerouslySetInnerHTML={{ __html: t("mip4.details.exempt").replace("exempt", "<strong>exempt</strong>") }} />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span dangerouslySetInnerHTML={{ __html: t("mip4.details.emptying").replace("Emptying exception:", "<strong>Emptying exception:</strong>") }} />
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-tertiary mt-0.5">&#8226;</span>
                <span>{t("mip4.details.o1Cost")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code example */}
        <div className="bg-surface-elevated rounded-xl border border-border p-5">
          <p className="font-mono text-xs text-text-tertiary mb-3">
            {t("mip4.details.usageInSolidity")}
          </p>
          <pre className="font-mono text-sm text-text-primary leading-relaxed overflow-x-auto">
{`interface IReserveBalance {
    function dippedIntoReserve() external returns (bool);
}

// Call the precompile at 0x1001
IReserveBalance reserve = IReserveBalance(address(0x1001));

// After a risky operation:
if (reserve.dippedIntoReserve()) {
    // Some account dropped below 10 MON reserve
    // Revert, adjust, or take alternate path
}`}
          </pre>
        </div>
      </div>
    </section>
  );
}
