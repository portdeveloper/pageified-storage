"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "../useInView";

interface ByteCell {
  hex: string;
  label: string;
  sub: string;
  style: "extension" | "selector" | "push" | "arg-restricted" | "arg-free" | "note";
}

const MODE_A_CELLS: ByteCell[] = [
  { hex: "0xAE", label: "EXTENSION", sub: "opcode", style: "extension" },
  { hex: "0x03", label: "selector", sub: "0x03 (valid)", style: "selector" },
  { hex: "0xA0", label: "arg 1", sub: "≠ 0x5B, ≠ PUSH", style: "arg-restricted" },
  { hex: "0xB2", label: "arg 2", sub: "≠ 0x5B, ≠ PUSH", style: "arg-restricted" },
  { hex: "0xC4", label: "arg 3", sub: "≠ 0x5B, ≠ PUSH", style: "arg-restricted" },
];

const MODE_B_CELLS: ByteCell[] = [
  { hex: "0xAE", label: "EXTENSION", sub: "opcode", style: "extension" },
  { hex: "0x03", label: "selector", sub: "0x03 (valid)", style: "selector" },
  { hex: "0x63", label: "PUSH4", sub: "frames 4 args", style: "push" },
  { hex: "0x5B", label: "arg 1", sub: "0x5B (safe)", style: "arg-free" },
  { hex: "0x60", label: "arg 2", sub: "0x60 (safe)", style: "arg-free" },
  { hex: "0xAB", label: "arg 3", sub: "any value", style: "arg-free" },
  { hex: "0xFF", label: "arg 4", sub: "any value", style: "arg-free" },
];

function cellColors(style: ByteCell["style"]) {
  switch (style) {
    case "extension":
      return "bg-text-primary text-surface border-text-primary";
    case "selector":
      return "bg-solution-bg text-solution-accent border-solution-accent";
    case "push":
      return "bg-surface text-text-primary border-text-secondary";
    case "arg-restricted":
      return "bg-surface-elevated text-text-secondary border-border";
    case "arg-free":
      return "bg-solution-cell text-solution-accent border-solution-accent-light";
    case "note":
      return "bg-surface text-text-tertiary border-dashed border-border";
  }
}

function ByteRow({ cells }: { cells: ByteCell[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {cells.map((cell, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={`w-16 h-12 rounded-lg border-2 flex items-center justify-center ${cellColors(cell.style)}`}
          >
            <span className="font-mono text-xs font-semibold">{cell.hex}</span>
          </div>
          <div className="text-center">
            <p className={`font-mono text-[9px] font-semibold ${cellColors(cell.style).split(" ").find(c => c.startsWith("text-")) ?? "text-text-secondary"}`}>
              {cell.label}
            </p>
            <p className="font-mono text-[8px] text-text-tertiary">{cell.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EncodingSection() {
  const { ref, isVisible } = useInView(0.1);
  const [mode, setMode] = useState<"A" | "B">("A");

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-alt relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Argument encoding
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-10">
          Extension opcodes have two ways to pass arguments. The choice depends
          on whether argument bytes need to include values in the restricted
          range (
          <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
            0x5B
          </code>{" "}
          or{" "}
          <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">
            0x60–0x7F
          </code>
          ).
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode("A")}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
              mode === "A"
                ? "bg-text-primary text-surface border-text-primary"
                : "bg-surface-elevated border-border hover:border-text-secondary"
            }`}
          >
            Mode A: Restricted-range
          </button>
          <button
            onClick={() => setMode("B")}
            className={`font-mono text-xs px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
              mode === "B"
                ? "bg-text-primary text-surface border-text-primary"
                : "bg-surface-elevated border-border hover:border-text-secondary"
            }`}
          >
            Mode B: PUSH-prefix
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "A" ? (
            <motion.div
              key="A"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="bg-surface-elevated rounded-xl border border-border p-6">
                <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-6">
                  0xAE &nbsp;selector &nbsp;arg₁ &nbsp;arg₂ &nbsp;…
                </p>
                <ByteRow cells={MODE_A_CELLS} />
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <p className="font-mono text-xs text-text-secondary">
                    <span className="text-solution-accent font-semibold">Simple.</span>{" "}
                    Argument bytes follow the selector inline. No overhead.
                  </p>
                  <p className="font-mono text-xs text-text-secondary">
                    <span className="text-problem-accent font-semibold">Constraint:</span>{" "}
                    Each argument byte must avoid{" "}
                    <span className="font-semibold">0x5B</span> and{" "}
                    <span className="font-semibold">0x60–0x7F</span>. Using a
                    forbidden value causes an exceptional halt.
                  </p>
                  <p className="font-mono text-xs text-text-tertiary">
                    Why: JUMPDEST analysis scans arg bytes normally, since 0xAE
                    doesn&apos;t eat them. Forbidden bytes would create analysis
                    divergence between chains.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="B"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="bg-surface-elevated rounded-xl border border-border p-6">
                <p className="font-mono text-xs text-text-tertiary uppercase tracking-wider mb-6">
                  0xAE &nbsp;selector &nbsp;PUSHn &nbsp;b₁ &nbsp;b₂ &nbsp;… &nbsp;bₙ
                </p>
                <ByteRow cells={MODE_B_CELLS} />
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <p className="font-mono text-xs text-text-secondary">
                    <span className="text-solution-accent font-semibold">Full range.</span>{" "}
                    A{" "}
                    <code className="font-mono bg-surface px-1 rounded border border-border">
                      PUSHn
                    </code>{" "}
                    byte immediately after the selector frames the next n
                    argument bytes. All values 0x00–0xFF are safe.
                  </p>
                  <p className="font-mono text-xs text-text-secondary">
                    <span className="text-solution-accent font-semibold">Why it works:</span>{" "}
                    JUMPDEST analysis encounters the real{" "}
                    <code className="font-mono bg-surface px-1 rounded border border-border">
                      PUSHn
                    </code>{" "}
                    opcode and correctly eats the next n bytes as its
                    immediates, including any 0x5B or PUSH-range bytes.
                    Analysis and execution agree on which bytes are consumed.
                  </p>
                  <p className="font-mono text-xs text-text-tertiary">
                    Trade-off: one extra byte of overhead (the PUSHn prefix).
                  </p>
                </div>
              </div>

              <div className="bg-surface-elevated rounded-xl border border-border p-5">
                <p className="font-mono text-xs text-text-tertiary mb-2">
                  Example: encoding argument value{" "}
                  <span className="text-problem-accent font-semibold">0x5B</span>
                </p>
                <div className="flex items-start gap-6 flex-wrap">
                  <div>
                    <p className="font-mono text-[10px] text-problem-accent mb-1.5">
                      Mode A: NOT allowed
                    </p>
                    <div className="flex gap-1.5 items-center">
                      <span className="font-mono text-xs px-2 py-1 rounded bg-text-primary text-surface">0xAE</span>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-solution-bg text-solution-accent border border-solution-accent">0x03</span>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-problem-accent text-white">0x5B</span>
                      <span className="font-mono text-[10px] text-problem-accent ml-1">← halt</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-solution-accent mb-1.5">
                      Mode B: safe
                    </p>
                    <div className="flex gap-1.5 items-center flex-wrap">
                      <span className="font-mono text-xs px-2 py-1 rounded bg-text-primary text-surface">0xAE</span>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-solution-bg text-solution-accent border border-solution-accent">0x03</span>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-surface text-text-primary border border-text-secondary">PUSH1</span>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-solution-cell text-solution-accent border border-solution-accent-light">0x5B</span>
                      <span className="font-mono text-[10px] text-solution-accent ml-1">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
