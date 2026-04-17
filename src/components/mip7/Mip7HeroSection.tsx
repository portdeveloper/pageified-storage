"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import SpecDisclaimer from "@/components/SpecDisclaimer";

// All Ethereum-defined opcodes as of Prague + PUSH0
const DEFINED_OPCODES = new Set<number>([
  // Stop + Arithmetic
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b,
  // Comparison & Bitwise
  0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d,
  // Keccak256
  0x20,
  // Environment
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f,
  // Block
  0x40, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a,
  // Stack / Memory / Control (includes JUMPDEST 0x5B, TLOAD/TSTORE 0x5C/0x5D, MCOPY 0x5E)
  0x50, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e,
  // PUSH0–PUSH32
  0x5f, 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f,
  0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f,
  // DUP1–DUP16
  0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f,
  // SWAP1–SWAP16
  0x90, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f,
  // LOG0–LOG4
  0xa0, 0xa1, 0xa2, 0xa3, 0xa4,
  // System
  0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xfa, 0xfd, 0xfe, 0xff,
]);

const EXTENSION = 0xae;
const DEFINED_COUNT = DEFINED_OPCODES.size; // 149
const UNDEFINED_COUNT = 256 - DEFINED_COUNT - 1; // 106

export default function Mip7HeroSection() {
  const { t } = useLanguage();
  const [showSubgrid, setShowSubgrid] = useState(false);

  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-3xl relative z-10 mt-30"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-[1.1] tracking-tight mb-6">
          {t("mip7.hero.title1")}{" "}
          <span className="font-semibold italic">{t("mip7.hero.titleHighlight")}</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary font-light max-w-xl mx-auto leading-relaxed">
          {t("mip7.hero.desc")}
        </p>
        <SpecDisclaimer />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 mb-16 relative z-10 w-full max-w-xl"
      >
        <div className="bg-surface-elevated rounded-xl p-6 shadow-sm border border-border">
          {/* Legend */}
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-xs text-text-tertiary">
              {t("mip7.hero.opcodeSpace")}
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#9b9084]" />
                {DEFINED_COUNT} {t("mip7.hero.defined")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-border" />
                {UNDEFINED_COUNT} {t("mip7.hero.free")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm inline-block bg-solution-accent" />
                {t("mip7.hero.reserved")}
              </span>
            </div>
          </div>

          {/* 16×16 opcode grid */}
          <div
            className="grid gap-[2px]"
            style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
          >
            {Array.from({ length: 256 }, (_, i) => {
              const isExtension = i === EXTENSION;
              const isDefined = DEFINED_OPCODES.has(i);
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.0015 }}
                  onClick={() => isExtension && setShowSubgrid((v) => !v)}
                  title={`0x${i.toString(16).toUpperCase().padStart(2, "0")}`}
                  aria-label={
                    isExtension
                      ? "0xAE: EXTENSION (click to expand)"
                      : `0x${i.toString(16).toUpperCase().padStart(2, "0")}`
                  }
                  className={`aspect-square rounded-[2px] relative ${
                    isExtension ? "cursor-pointer" : "cursor-default"
                  }`}
                  style={{
                    backgroundColor: isExtension
                      ? "#2a7d6a"
                      : isDefined
                      ? "#9b9084"
                      : "#e2ddd7",
                  }}
                >
                  {isExtension && (
                    <motion.div
                      animate={{ opacity: [1, 0.45, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-[2px] bg-solution-accent"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="font-mono text-[10px] text-text-tertiary">
              {t("mip7.hero.clickToExpand")}
            </p>
          </div>

          {/* Sub-grid reveal */}
          {showSubgrid && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 pt-5 border-t border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-xs text-solution-accent font-semibold">
                  {t("mip7.hero.extensionSelectors")}
                </p>
                <p className="font-mono text-[10px] text-text-tertiary">
                  {t("mip7.hero.allInvalid")}
                </p>
              </div>
              <div
                className="grid gap-[2px]"
                style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
              >
                {Array.from({ length: 256 }, (_, i) => (
                  <div
                    key={i}
                    title={`selector 0x${i.toString(16).toUpperCase().padStart(2, "0")}`}
                    className="aspect-square rounded-[2px] bg-solution-cell"
                  />
                ))}
              </div>
              <p className="font-mono text-[10px] text-text-tertiary mt-2">
                {t("mip7.hero.selectorsFuture")}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
