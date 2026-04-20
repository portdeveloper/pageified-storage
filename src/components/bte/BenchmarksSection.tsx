"use client";

import { motion } from "framer-motion";
import { useInView } from "../useInView";
import { Card } from "../ui/Card";

interface BarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
  highlight?: boolean;
  sub?: string;
}

function Bar({ label, value, max, unit, color, highlight, sub }: BarProps) {
  const pct = (value / max) * 100;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span
          className={`font-mono text-[11px] ${
            highlight ? "text-solution-accent font-semibold" : "text-text-tertiary"
          }`}
        >
          {label}
        </span>
        <span className="font-mono text-[11px] font-semibold tabular-nums">
          {value} {unit}
        </span>
      </div>
      <div className="h-6 rounded bg-border/40 relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded"
          style={{ backgroundColor: color }}
        />
      </div>
      {sub && (
        <p className="font-mono text-[10px] text-text-tertiary mt-1">{sub}</p>
      )}
    </div>
  );
}

export default function BenchmarksSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase mb-3">
          Benchmarks
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Faster than the best prior schemes
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          The authors reimplemented the two strongest prior schemes (PFE and
          BEAT++) in the same aggressively-optimized C++ codebase as BTX
          itself — AVX-512 vectorization, FFT backends, optimized MSM and
          pairing paths. This is a comparison against tuned baselines, not
          reference code.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Total decryption */}
          <Card>
            <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-wider mb-1">
              Total decryption time
            </p>
            <p className="font-mono text-[10px] text-text-tertiary mb-5">
              Batch size B = 512, single core
            </p>

            <Bar
              label="PFE (Boneh et al.)"
              value={1197}
              max={1200}
              unit="ms"
              color="#c4653a"
            />
            <Bar
              label="BTX"
              value={598}
              max={1200}
              unit="ms"
              color="#2a7d6a"
              highlight
              sub="2.0× faster overall"
            />
          </Card>

          {/* Per-ct open phase */}
          <Card>
            <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-wider mb-1">
              Open phase, per ciphertext
            </p>
            <p className="font-mono text-[10px] text-text-tertiary mb-5">
              Final unmasking step at B = 512
            </p>

            <Bar
              label="PFE"
              value={0.723}
              max={0.75}
              unit="ms"
              color="#c4653a"
              sub="4 pairings per ciphertext"
            />
            <Bar
              label="BTX"
              value={0.171}
              max={0.75}
              unit="ms"
              color="#2a7d6a"
              highlight
              sub="1 pairing per ciphertext — 4.2× faster"
            />
          </Card>
        </div>

        <Card>
          <p className="font-mono text-[11px] text-text-tertiary uppercase tracking-wider mb-4">
            How decryption time scales with batch size
          </p>
          <ScaleTable />
          <p className="font-mono text-[10px] text-text-tertiary mt-4 leading-relaxed">
            Measured on an AWS instance with an Intel Xeon Platinum 8488C
            (3.8 GHz), using the <span className="font-mono">blst</span>{" "}
            library over BLS12-381 with AVX-512, compiled with Clang 21.1.8.
            Per-ciphertext numbers from BTX Table 4; totals from §8.
          </p>
        </Card>
      </div>
    </section>
  );
}

interface Row {
  b: number;
  pfePrecompute: number;
  btxPrecompute: number;
  pfeOpen: number;
  btxOpen: number;
}

const ROWS: Row[] = [
  { b: 32, pfePrecompute: 0.963, btxPrecompute: 0.644, pfeOpen: 0.721, btxOpen: 0.171 },
  { b: 64, pfePrecompute: 1.12, btxPrecompute: 0.722, pfeOpen: 0.721, btxOpen: 0.171 },
  { b: 128, pfePrecompute: 1.278, btxPrecompute: 0.801, pfeOpen: 0.721, btxOpen: 0.171 },
  { b: 256, pfePrecompute: 1.436, btxPrecompute: 0.88, pfeOpen: 0.722, btxOpen: 0.171 },
  { b: 512, pfePrecompute: 1.596, btxPrecompute: 0.959, pfeOpen: 0.723, btxOpen: 0.171 },
];

function ScaleTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-3 font-mono text-[10px] text-text-tertiary uppercase tracking-wider font-normal">
              Batch B
            </th>
            <th className="text-right py-2 px-3 font-mono text-[10px] text-text-tertiary uppercase tracking-wider font-normal">
              PFE precompute
            </th>
            <th className="text-right py-2 px-3 font-mono text-[10px] text-text-tertiary uppercase tracking-wider font-normal">
              BTX precompute
            </th>
            <th className="text-right py-2 px-3 font-mono text-[10px] text-text-tertiary uppercase tracking-wider font-normal">
              PFE open
            </th>
            <th className="text-right py-2 pl-3 font-mono text-[10px] text-text-tertiary uppercase tracking-wider font-normal">
              BTX open
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.b} className="border-b border-border/50">
              <td className="py-2 pr-3 font-mono text-xs tabular-nums">{r.b}</td>
              <td className="text-right py-2 px-3 font-mono text-xs text-text-secondary tabular-nums">
                {r.pfePrecompute} ms/ct
              </td>
              <td className="text-right py-2 px-3 font-mono text-xs text-solution-accent font-semibold tabular-nums">
                {r.btxPrecompute} ms/ct
              </td>
              <td className="text-right py-2 px-3 font-mono text-xs text-text-secondary tabular-nums">
                {r.pfeOpen} ms/ct
              </td>
              <td className="text-right py-2 pl-3 font-mono text-xs text-solution-accent font-semibold tabular-nums">
                {r.btxOpen} ms/ct
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
