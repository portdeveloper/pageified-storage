"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useInView } from "../useInView";

function ethMemoryCost(bytes: number): number {
  const words = Math.ceil(bytes / 32);
  return Math.floor((words * words) / 512) + 3 * words;
}

function mip3MemoryCost(bytes: number): number {
  const words = Math.ceil(bytes / 32);
  return Math.floor(words / 2);
}

const MIN_EXP = 5; // 32 bytes (2^5)
const MAX_EXP = 23; // 8 MB (2^23)
const SLIDER_STEPS = 200;

const THRESHOLDS = [
  { bytes: 2 * 1024, label: "2 KB", sub: "avg usage" },
  { bytes: 2 * 1024 * 1024, label: "2 MB", sub: "historical max" },
  { bytes: 3.76 * 1024 * 1024, label: "~3.76 MB", sub: "ETH block limit" },
  { bytes: 8 * 1024 * 1024, label: "8 MB", sub: "MIP-3 cap" },
];

function formatBytes(b: number): string {
  if (b >= 1_048_576) return `${(b / 1_048_576).toFixed(b >= 10_485_760 ? 0 : 1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(b >= 10240 ? 0 : 1)} KB`;
  return `${b} B`;
}

function formatGas(g: number): string {
  if (g >= 1_000_000_000) return `${(g / 1_000_000_000).toFixed(1)}B`;
  if (g >= 1_000_000) return `${(g / 1_000_000).toFixed(g >= 10_000_000 ? 0 : 1)}M`;
  if (g >= 1_000) return `${(g / 1_000).toFixed(g >= 10_000 ? 0 : 1)}K`;
  return `${g}`;
}

export default function CostCurveSection() {
  const { ref, isVisible } = useInView(0.1);
  const [sliderValue, setSliderValue] = useState(100); // middle-ish

  const currentBytes = useMemo(() => {
    const exp = MIN_EXP + (sliderValue / SLIDER_STEPS) * (MAX_EXP - MIN_EXP);
    return Math.round(Math.pow(2, exp));
  }, [sliderValue]);

  const ethGas = ethMemoryCost(currentBytes);
  const mip3Gas = mip3MemoryCost(currentBytes);
  const ratio = mip3Gas > 0 ? ethGas / mip3Gas : 1;
  const savings = ethGas > 0 ? Math.round(((ethGas - mip3Gas) / ethGas) * 100) : 0;
  const ethImpossible = ethGas > 30_000_000;

  // Build bar chart data points
  const chartPoints = useMemo(() => {
    const points = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const exp = MIN_EXP + (i / steps) * (MAX_EXP - MIN_EXP);
      const bytes = Math.round(Math.pow(2, exp));
      const eth = ethMemoryCost(bytes);
      const mip3 = mip3MemoryCost(bytes);
      points.push({ bytes, eth, mip3 });
    }
    return points;
  }, []);

  // Max for bar scaling (cap at 30M for visual, since ETH goes way beyond)
  const maxGasForChart = 30_000_000;

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-alt relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          The quadratic wall
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-2">
          Ethereum charges <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">words&sup2;/512 + 3*words</code> for
          memory. MIP-3 charges <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">words/2</code>.
          Drag the slider to see how they diverge.
        </p>

        {/* Slider */}
        <div className="bg-surface-elevated rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs text-text-tertiary">Memory allocation size</p>
            <motion.p
              key={currentBytes}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="font-mono text-2xl font-semibold text-text-primary tabular-nums"
            >
              {formatBytes(currentBytes)}
            </motion.p>
          </div>
          <input
            type="range"
            min={0}
            max={SLIDER_STEPS}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full accent-solution-accent cursor-pointer"
          />
          <div className="flex justify-between font-mono text-xs text-text-tertiary mt-1">
            <span>32 B</span>
            <span>8 MB</span>
          </div>

          {/* Threshold markers */}
          <div className="flex flex-wrap gap-2 mt-4">
            {THRESHOLDS.map((t) => {
              const isActive = Math.abs(currentBytes - t.bytes) / t.bytes < 0.15;
              return (
                <button
                  key={t.label}
                  onClick={() => {
                    const exp = Math.log2(t.bytes);
                    setSliderValue(
                      Math.round(((exp - MIN_EXP) / (MAX_EXP - MIN_EXP)) * SLIDER_STEPS)
                    );
                  }}
                  className={`font-mono text-xs px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                    isActive
                      ? "bg-text-primary text-surface border-text-primary"
                      : "bg-surface border-border hover:border-text-secondary"
                  }`}
                >
                  {t.label}
                  <span className="text-text-tertiary ml-1.5">{t.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* ETH gas */}
          <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-5">
            <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-3">
              Quadratic (ETH)
            </p>
            <motion.p
              key={`eth-${ethGas}`}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="font-mono text-2xl sm:text-3xl font-semibold text-problem-accent tabular-nums"
            >
              {ethImpossible ? "IMPOSSIBLE" : formatGas(ethGas)}
            </motion.p>
            {!ethImpossible && (
              <p className="font-mono text-xs text-text-tertiary mt-1">gas</p>
            )}
            {ethImpossible && (
              <p className="font-mono text-xs text-problem-accent mt-1">
                exceeds 30M block limit
              </p>
            )}
          </div>

          {/* MIP-3 gas */}
          <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-5">
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-3">
              Linear (MIP-3)
            </p>
            <motion.p
              key={`mip3-${mip3Gas}`}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="font-mono text-2xl sm:text-3xl font-semibold text-solution-accent tabular-nums"
            >
              {formatGas(mip3Gas)}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary mt-1">gas</p>
          </div>

          {/* Ratio */}
          <div className="bg-surface-elevated rounded-xl border border-border p-5">
            <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-3">
              Improvement
            </p>
            <motion.p
              key={`ratio-${Math.round(ratio)}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={`font-mono text-2xl sm:text-3xl font-semibold tabular-nums ${
                ratio >= 10 ? "text-solution-accent" : "text-text-primary"
              }`}
            >
              {ethImpossible ? "∞" : `${ratio.toFixed(ratio >= 100 ? 0 : 1)}x`}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary mt-1">
              {ethImpossible ? "only possible with MIP-3" : `${savings}% cheaper`}
            </p>
          </div>
        </div>

        {/* Visual bar comparison */}
        <div className="bg-surface-elevated rounded-xl border border-border p-6">
          <p className="font-mono text-xs text-text-tertiary mb-4">
            Gas cost across memory sizes (log scale, capped at 30M for visibility)
          </p>
          <div className="space-y-1.5">
            {chartPoints.map((point, i) => {
              const ethWidth = Math.min(100, (point.eth / maxGasForChart) * 100);
              const mip3Width = Math.min(100, (point.mip3 / maxGasForChart) * 100);
              const ethCapped = point.eth > maxGasForChart;
              const isSelected =
                Math.abs(Math.log2(point.bytes) - Math.log2(currentBytes)) < 0.5;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-opacity ${
                    isSelected ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <span className="font-mono text-xs text-text-tertiary w-14 text-right shrink-0 tabular-nums">
                    {formatBytes(point.bytes)}
                  </span>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="w-full h-2 bg-problem-cell rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ethCapped ? "bg-problem-accent/60" : "bg-problem-accent"
                        }`}
                        style={{ width: `${Math.max(0.5, ethWidth)}%` }}
                      />
                    </div>
                    <div className="w-full h-2 bg-solution-cell rounded-full overflow-hidden">
                      <div
                        className="h-full bg-solution-accent rounded-full"
                        style={{ width: `${Math.max(0.5, mip3Width)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4 font-mono text-xs text-text-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-full bg-problem-accent inline-block" />
              Quadratic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded-full bg-solution-accent inline-block" />
              Linear (MIP-3)
            </span>
            <span className="ml-auto">30M gas block limit shown as 100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
