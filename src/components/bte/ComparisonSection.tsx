"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";
import { useInView } from "../useInView";
import { PROPERTY_EXPLAIN, SCHEMES, type SchemeRow } from "./shared";
import { useExplainMode } from "./ExplainModeContext";
import Hint from "./Hint";

type PropKey = keyof typeof PROPERTY_EXPLAIN;

function Mark({ value }: { value: "yes" | "no" | "mixed" }) {
  if (value === "yes") {
    return (
      <span
        className="inline-flex w-[22px] h-[22px] rounded-full items-center justify-center font-semibold text-xs"
        style={{
          background: "color-mix(in oklab, " + colors.solutionAccent + " 15%, transparent)",
          color: colors.solutionAccent,
        }}
      >
        ✓
      </span>
    );
  }
  if (value === "no") {
    return (
      <span
        className="inline-flex w-[22px] h-[22px] rounded-full items-center justify-center font-semibold text-xs"
        style={{
          background: "color-mix(in oklab, " + colors.problemAccent + " 15%, transparent)",
          color: colors.problemAccentStrong,
        }}
      >
        ✗
      </span>
    );
  }
  return (
    <span
      className="inline-flex px-2 py-0.5 rounded-[10px] font-mono text-[9px]"
      style={{ background: colors.border, color: colors.textTertiary }}
    >
      ✓/✗
    </span>
  );
}

const PROP_COLUMN_KEYS: PropKey[] = ["cr", "ep", "decrypt", "ctxt"];

const PROP_HEADER_LABELS: Record<PropKey, string> = {
  cr: "Collision-free",
  ep: "Epochless",
  decrypt: "Decryption cost",
  ctxt: "Ciphertext",
};

export default function ComparisonSection() {
  const { ref, isVisible } = useInView(0.1);
  const [active, setActive] = useState<PropKey | null>(null);
  const { mode } = useExplainMode();
  const simple = mode === "simple";

  return (
    <section
      ref={ref}
      className="py-24 px-6 bg-surface-elevated border-y border-border"
    >
      <div
        className={`max-w-[1120px] mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="mb-4 text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.015em]">
          {simple ? "How BTX stacks up" : "Every other BTE scheme trades off"}
        </h2>
        <p className="text-[1.075rem] text-text-secondary font-light leading-[1.6] max-w-[46rem] mb-7">
          {simple ? (
            <>
              Four things matter for a usable encrypted mempool. Every earlier
              scheme drops at least one of them. BTX is the first to get all
              four. Hover a column to see what each one means.
            </>
          ) : (
            <>
              Four properties each matter for a usable{" "}
              <Hint term="encrypted mempool">encrypted mempool</Hint>. Every
              prior scheme drops at least one. Hover or focus a column to see
              why it&apos;s needed.
            </>
          )}
        </p>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-surface-elevated">
          <table className="w-full border-collapse min-w-[720px] text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left py-3.5 px-4 font-mono text-[10px] tracking-[0.08em] uppercase text-text-tertiary font-medium">
                  Scheme
                </th>
                {PROP_COLUMN_KEYS.map((key) => {
                  const align =
                    key === "cr" || key === "ep" ? "text-center" : "text-left";
                  const isActive = active === key;
                  return (
                    <th
                      key={key}
                      scope="col"
                      className={`${align} py-3.5 px-3 font-mono text-[10px] tracking-[0.08em] uppercase text-text-tertiary font-medium cursor-help`}
                      onMouseEnter={() => setActive(key)}
                      onMouseLeave={() =>
                        setActive((a) => (a === key ? null : a))
                      }
                    >
                      <button
                        type="button"
                        onFocus={() => setActive(key)}
                        onBlur={() =>
                          setActive((a) => (a === key ? null : a))
                        }
                        className="font-mono text-[10px] tracking-[0.08em] uppercase text-text-tertiary font-medium w-full"
                        style={{
                          textAlign:
                            key === "cr" || key === "ep" ? "center" : "left",
                          background: "transparent",
                          padding: 0,
                          margin: 0,
                          border: "none",
                          color: "inherit",
                          cursor: "help",
                        }}
                        aria-describedby="comparison-explainer"
                        aria-pressed={isActive}
                      >
                        {PROP_HEADER_LABELS[key]}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SCHEMES.map((s, i) => (
                <SchemeRowView
                  key={s.name}
                  scheme={s}
                  index={i}
                  active={active}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {SCHEMES.map((s) => (
            <div
              key={s.name}
              className={`rounded-xl border p-4 ${
                s.highlight
                  ? "bg-solution-bg border-solution-accent/30"
                  : "bg-surface border-border"
              }`}
            >
              <p
                className={`font-semibold mb-3 ${
                  s.highlight ? "text-solution-accent" : ""
                }`}
              >
                {s.name}
                {s.ref && (
                  <span className="font-mono text-[10px] text-text-tertiary ml-1.5">
                    {s.ref}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Mark value={s.cr} />
                  <span className="text-text-tertiary">Collision-free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mark value={s.ep} />
                  <span className="text-text-tertiary">Epochless</span>
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-border/50">
                  <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">
                    Decryption
                  </p>
                  <p className="font-mono text-[11px]">{s.decrypt}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">
                    Ciphertext
                  </p>
                  <p className="font-mono text-[11px]">{s.ctxt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          id="comparison-explainer"
          role="status"
          aria-live="polite"
          className="mt-[18px] bg-surface-elevated border border-border rounded-[10px] px-[18px] py-3.5 min-h-[48px] transition-all"
        >
          {active ? (
            <>
              <p className="font-mono text-[10.5px] tracking-[0.08em] uppercase font-semibold text-solution-accent mb-1">
                {PROPERTY_EXPLAIN[active].label}
              </p>
              <p className="text-[13px] text-text-secondary leading-[1.55] m-0">
                {PROPERTY_EXPLAIN[active].body}
              </p>
            </>
          ) : (
            <p className="font-mono text-[11px] text-text-tertiary m-0">
              Hover a property to learn why it matters.
            </p>
          )}
        </div>

        <p className="font-mono text-[11px] text-text-tertiary mt-4 leading-[1.6]">
          B = actual batch size, Bmax = maximum supported. |G₁|, |G_T| are
          group element sizes (BLS12-381). Adapted from BTX, Table 1.
          <br />
          <span className="text-text-tertiary/80">
            * Original PFE is O(B²); the BTX authors&apos; FFT-based
            re-implementation reduces it to O(Bmax log Bmax), still ~2× slower
            than BTX in practice.
          </span>
        </p>
      </div>
    </section>
  );
}

function SchemeRowView({
  scheme,
  index,
  active,
}: {
  scheme: SchemeRow;
  index: number;
  active: PropKey | null;
}) {
  const highlight = scheme.highlight;
  const cellBg = (key: PropKey) =>
    active === key
      ? {
          background:
            "color-mix(in oklab, " +
            colors.solutionAccent +
            " 8%, transparent)",
        }
      : undefined;
  return (
    <tr
      style={
        highlight
          ? {
              background: colors.solutionBg,
              borderTop: "2px solid " + colors.solutionAccent,
            }
          : index > 0
            ? { borderTop: "1px solid " + colors.borderSoft }
            : undefined
      }
    >
      <td className="py-3 px-4">
        <span
          style={
            highlight
              ? { fontWeight: 600, color: colors.solutionAccent }
              : { color: colors.textPrimary }
          }
        >
          {scheme.name}
        </span>
        {scheme.ref && (
          <span className="font-mono text-[10px] text-text-tertiary ml-1.5">
            {scheme.ref}
          </span>
        )}
      </td>
      <td
        className="text-center py-3 px-3 transition-colors duration-150"
        style={cellBg("cr")}
      >
        <Mark value={scheme.cr} />
      </td>
      <td
        className="text-center py-3 px-3 transition-colors duration-150"
        style={cellBg("ep")}
      >
        <Mark value={scheme.ep} />
      </td>
      <td
        className="py-3 px-3 font-mono text-[12px] text-text-secondary transition-colors duration-150"
        style={cellBg("decrypt")}
      >
        {scheme.decrypt}
      </td>
      <td
        className="py-3 px-4 font-mono text-[12px] text-text-secondary transition-colors duration-150"
        style={cellBg("ctxt")}
      >
        {scheme.ctxt}
      </td>
    </tr>
  );
}
