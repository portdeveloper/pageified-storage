"use client";

import { useState } from "react";
import { useExplainMode } from "./ExplainModeContext";

interface HintProps {
  term: string;
  children?: React.ReactNode;
}

interface HintEntry {
  desc: string;
  href?: string;
}

const HINTS: Record<string, HintEntry> = {
  mev: {
    desc: "Maximal Extractable Value. Profit a block producer can capture by reordering, inserting, or censoring transactions.",
    href: "https://ethereum.org/en/developers/docs/mev/",
  },
  mempool: {
    desc: "The queue of pending transactions waiting to be included in a block.",
  },
  "encrypted mempool": {
    desc: "A mempool where transactions stay encrypted until the builder commits to a batch, so bots can't front-run them.",
  },
  "threshold encryption": {
    desc: "Encryption where a committee of servers jointly holds the decryption key, and a threshold of them must cooperate to decrypt.",
    href: "https://en.wikipedia.org/wiki/Threshold_cryptosystem",
  },
  ciphertext: {
    desc: "The output of an encryption function: scrambled data plus any extra pieces needed to decrypt.",
    href: "https://en.wikipedia.org/wiki/Ciphertext",
  },
  committee: {
    desc: "A set of servers that jointly produce decryption shares in a threshold scheme.",
  },
  "decryption share": {
    desc: "A partial decryption from one committee member. Shares combine to recover the plaintext.",
  },
  collision: {
    desc: "Two ciphertexts that cannot both be decrypted in the same batch, so one must be dropped.",
  },
  "collision-free": {
    desc: "Any set of ciphertexts the builder picks can always be decrypted together, with no conflicts.",
  },
  epoch: {
    desc: "A fixed time window after which a scheme requires a new setup or key refresh.",
  },
  epochless: {
    desc: "A scheme that does not require recurring setups. Keys stay valid indefinitely.",
  },
  crs: {
    desc: "Common Reference String. Public parameters produced by a one-time trusted setup.",
  },
  pairing: {
    desc: "A bilinear map between two elliptic-curve groups. A building block for many threshold schemes.",
    href: "https://en.wikipedia.org/wiki/Pairing-based_cryptography",
  },
  fft: {
    desc: "Fast Fourier Transform. Reduces polynomial operations from O(B²) to O(B log B).",
    href: "https://en.wikipedia.org/wiki/Fast_Fourier_transform",
  },
  elgamal: {
    desc: "A public-key encryption scheme whose ciphertext is two group elements.",
    href: "https://en.wikipedia.org/wiki/ElGamal_encryption",
  },
  "shamir shares": {
    desc: "A secret-sharing scheme where any t of n parties can reconstruct a secret.",
    href: "https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing",
  },
  pfe: {
    desc: "Prior batched-threshold-encryption scheme by Boneh et al. The fastest previously known construction.",
  },
  builder: {
    desc: "The node that selects and orders transactions for the next block.",
  },
  batch: {
    desc: "The subset of pending transactions the builder picks to include in a block.",
  },
};

export default function Hint({ term, children }: HintProps) {
  const [open, setOpen] = useState(false);
  const { mode } = useExplainMode();
  if (mode !== "simple") return <>{children ?? term}</>;
  const entry = HINTS[term.toLowerCase()];
  if (!entry) return <>{children ?? term}</>;

  return (
    <span
      className="relative inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children ?? term}
      <sup className="ml-[2px] mr-[1px] leading-none">
        <span
          className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-border text-text-tertiary text-[8px] font-mono font-semibold leading-none cursor-help align-middle"
          onTouchStart={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        >
          ?
        </span>
      </sup>
      {open && (
        <span className="absolute bottom-full left-0 px-3 py-2 rounded-lg bg-text-primary text-surface text-xs font-sans font-normal leading-[1.55] w-64 text-left shadow-lg z-50">
          {entry.desc}
          {entry.href && (
            <>
              {" "}
              <a
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-solution-cell whitespace-nowrap"
              >
                Read more →
              </a>
            </>
          )}
          <span className="absolute top-full left-4 border-4 border-transparent border-t-text-primary" />
        </span>
      )}
    </span>
  );
}
