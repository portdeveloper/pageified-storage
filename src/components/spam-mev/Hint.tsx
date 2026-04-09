"use client";

import { useState } from "react";

interface HintProps {
  term: string;
  children?: React.ReactNode;
}

const HINTS: Record<string, string> = {
  mev: "Maximal Extractable Value - profit from reordering, inserting, or censoring transactions in a block.",
  gas: "A unit measuring computational work on a blockchain. Every transaction consumes gas.",
  mempool: "A waiting area where pending transactions sit before being included in a block.",
  "block gas": "The total computational capacity available in a single block.",
  "clearing price": "The gas price at which total demand exactly fills the block. Everyone included pays at least this much.",
  "b_max": "The maximum gas capacity of a block. A design parameter that blockchain teams can adjust.",
  "b_plat": "The plateau threshold - the block size beyond which adding more capacity no longer changes the equilibrium.",
  pfo: "Priority Fee Ordering - sorting transactions by how much they bid, so higher-paying transactions go first.",
  "user welfare": "The aggregate benefit users get from their transactions minus the fees they pay.",
  "spam share": "The fraction of total included block gas consumed by spam transactions.",
  gmin: "A protocol-enforced floor on the gas price per transaction, regardless of how empty the block is.",
  searcher: "A bot that monitors blockchains for profitable MEV opportunities and submits transactions to capture them.",
  dex: "Decentralized Exchange - a protocol that lets users swap tokens directly on-chain without an intermediary.",
  sequencer: "The entity responsible for ordering and batching transactions on a rollup before posting them to L1.",
};

export default function Hint({ term, children }: HintProps) {
  const [open, setOpen] = useState(false);
  const description = HINTS[term.toLowerCase()];
  if (!description) return <>{children ?? term}</>;

  return (
    <span
      className="relative inline-flex items-baseline gap-0.5 cursor-help"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onTouchStart={() => setOpen((o) => !o)}
    >
      {children ?? term}
      <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-border text-text-tertiary text-[8px] font-mono font-semibold leading-none flex-shrink-0 translate-y-[-2px]">
        ?
      </span>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-text-primary text-surface text-xs font-sans font-normal leading-relaxed w-56 text-center shadow-lg z-50 pointer-events-none">
          {description}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-text-primary" />
        </span>
      )}
    </span>
  );
}
