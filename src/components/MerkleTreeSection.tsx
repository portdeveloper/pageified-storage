"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useInView } from "./useInView";

// Simplified tree: show 8 leaves (pairs) → 4 → 2 → 1 root
// In reality it's 64 leaves → 6 levels, but we show a simplified version
const LEAF_COUNT = 8;
const LEVELS = 4; // 8 → 4 → 2 → 1

interface TreeNode {
  level: number;
  index: number;
  label: string;
}

function buildTree(): TreeNode[][] {
  const levels: TreeNode[][] = [];

  // Level 0: leaves (pair-leaves)
  const leaves: TreeNode[] = [];
  for (let i = 0; i < LEAF_COUNT; i++) {
    leaves.push({
      level: 0,
      index: i,
      label: `[${i * 2},${i * 2 + 1}]`,
    });
  }
  levels.push(leaves);

  // Internal levels
  let prevCount = LEAF_COUNT;
  for (let l = 1; l < LEVELS; l++) {
    const count = prevCount / 2;
    const nodes: TreeNode[] = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        level: l,
        index: i,
        label: l === LEVELS - 1 ? "root" : `h${l}.${i}`,
      });
    }
    levels.push(nodes);
    prevCount = count;
  }

  return levels;
}

export default function MerkleTreeSection() {
  const { ref, isVisible } = useInView(0.1);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const tree = useMemo(() => buildTree(), []);

  // Compute proof path: for a selected leaf, its sibling + ancestors
  const proofPath = useMemo(() => {
    if (selectedSlot === null) return new Set<string>();
    const path = new Set<string>();
    let idx = Math.floor(selectedSlot / 2); // which leaf pair
    path.add(`0-${idx}`); // the leaf itself

    // Sibling
    const siblingLeaf = idx % 2 === 0 ? idx + 1 : idx - 1;
    path.add(`0-${siblingLeaf}-sibling`);

    // Walk up
    for (let l = 1; l < LEVELS; l++) {
      idx = Math.floor(idx / 2);
      path.add(`${l}-${idx}`);
      const sibling = idx % 2 === 0 ? idx + 1 : idx - 1;
      if (sibling >= 0 && sibling < tree[l].length) {
        path.add(`${l}-${sibling}-sibling`);
      }
    }

    return path;
  }, [selectedSlot, tree]);

  const isOnPath = (level: number, index: number) => {
    return proofPath.has(`${level}-${index}`) || proofPath.has(`${level}-${index}-sibling`);
  };

  const isSibling = (level: number, index: number) => {
    return proofPath.has(`${level}-${index}-sibling`);
  };

  const isTarget = (level: number, index: number) => {
    return proofPath.has(`${level}-${index}`) && !isSibling(level, index);
  };

  return (
    <section ref={ref} className="py-24 px-6 bg-solution-bg relative">
      <div
        className={`max-w-4xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-solution-muted uppercase mb-3">
          Commitment scheme
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          BLAKE3 page commitments
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-2xl leading-relaxed mb-4">
          Each 4,096-byte page is committed by a fixed binary tree built from
          the BLAKE3 compression function. The full tree has 128 slots pairing
          into 64 leaves across 6 levels. Below is a simplified 16-slot view
          showing the proof structure.
        </p>
        <p className="text-base text-text-secondary font-light max-w-2xl leading-relaxed mb-10">
          Click any slot below to see its inclusion proof path. The page-local
          witness contains a caller-supplied word index, the 32-byte word, its
          32-byte sibling, and one sibling hash per parent level. If the index
          is encoded in 1 byte, that is about 257 bytes before the MPT proof
          for the page commitment.
        </p>

        {/* Slot selector */}
        <div className="flex flex-wrap gap-1.5 mb-8">
          {Array.from({ length: 16 }, (_, i) => (
            <button
              key={i}
              onClick={() =>
                setSelectedSlot(selectedSlot === i ? null : i)
              }
              className={`w-10 h-10 rounded-md font-mono text-xs border transition-all cursor-pointer ${
                selectedSlot === i
                  ? "bg-solution-accent text-white border-solution-accent"
                  : "bg-surface-elevated border-border hover:border-solution-accent"
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        {/* Tree visualization */}
        <div className="bg-surface-elevated rounded-xl border border-border p-6 sm:p-8 overflow-x-auto">
          <div className="flex flex-col-reverse gap-6 min-w-[500px]">
            {tree.map((level, levelIdx) => (
              <div key={levelIdx} className="flex justify-center gap-2 sm:gap-3">
                {level.map((node) => {
                  const onPath = selectedSlot !== null && isOnPath(node.level, node.index);
                  const sibling = selectedSlot !== null && isSibling(node.level, node.index);
                  const target = selectedSlot !== null && isTarget(node.level, node.index);

                  let bgClass = "bg-solution-cell";
                  if (target) bgClass = "bg-solution-accent";
                  else if (sibling) bgClass = "bg-problem-accent";
                  else if (onPath) bgClass = "bg-solution-accent-light";

                  let textClass = "text-text-tertiary";
                  if (target) textClass = "text-white";
                  else if (sibling) textClass = "text-white";

                  return (
                    <motion.div
                      key={`${node.level}-${node.index}`}
                      layout
                      className={`px-3 py-2 rounded-md font-mono text-[11px] ${bgClass} ${textClass} transition-colors duration-300 text-center min-w-[50px]`}
                    >
                      {node.label}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Level labels */}
          <div className="flex justify-between mt-4 font-mono text-[10px] text-text-tertiary">
            <span>pair-leaves (64 in full tree)</span>
            <span>BLAKE3 compression at each level</span>
            <span>32-byte root</span>
          </div>
        </div>

        {/* Proof details */}
        <AnimatePresence>
          {selectedSlot !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-surface-elevated rounded-lg border border-border p-4">
                <p className="font-mono text-xs text-text-tertiary mb-3">
                  Inclusion proof for slot {selectedSlot}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-md bg-solution-bg">
                    <p className="font-mono text-[10px] text-text-tertiary">
                      Word index
                    </p>
                    <p className="font-mono text-sm font-semibold text-solution-accent">
                      1 byte typical
                    </p>
                    <p className="font-mono text-[9px] text-text-tertiary mt-0.5">
                      caller-supplied
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-problem-bg">
                    <p className="font-mono text-[10px] text-text-tertiary">
                      Target word
                    </p>
                    <p className="font-mono text-sm font-semibold text-problem-accent">
                      32 bytes
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-problem-bg">
                    <p className="font-mono text-[10px] text-text-tertiary">
                      Sibling word
                    </p>
                    <p className="font-mono text-sm font-semibold text-problem-accent">
                      32 bytes
                    </p>
                  </div>
                  <div className="p-3 rounded-md bg-surface">
                    <p className="font-mono text-[10px] text-text-tertiary">
                      Parent siblings
                    </p>
                    <p className="font-mono text-sm font-semibold text-text-primary">
                      6 x 32 bytes
                    </p>
                    <p className="font-mono text-[9px] text-text-tertiary mt-0.5">
                      pair-leaf to root
                    </p>
                  </div>
                </div>
                <p className="font-mono text-[10px] text-text-tertiary mt-3">
                  About 257 bytes with a 1-byte index, plus the MPT proof for
                  the page commitment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
