export interface SchemeRow {
  name: string;
  cr: "yes" | "no" | "mixed";
  ep: "yes" | "no";
  setup: string;
  decrypt: string;
  ctxt: string;
  highlight?: boolean;
}

// Order matches the picker in EncryptedMempoolSection.
export const SCHEMES: SchemeRow[] = [
  {
    name: "Batched IBE",
    cr: "mixed",
    ep: "no",
    setup: "per epoch",
    decrypt: "O(B log² B) / O(Bmax log Bmax)",
    ctxt: "3·|G₁| + |G_T|",
  },
  {
    name: "Fernando et al. (TrX)",
    cr: "yes",
    ep: "yes",
    setup: "grows with sessions",
    decrypt: "O(B log² B)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "BEAT-MEV",
    cr: "no",
    ep: "yes",
    setup: "one-time",
    decrypt: "O(B²)",
    ctxt: "3·|G₁| + |G_T|",
  },
  {
    name: "Gong et al.",
    cr: "mixed",
    ep: "no",
    setup: "per epoch",
    decrypt: "O(B log² B) / O(Bmax log Bmax)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "BEAT++ (Agarwal)",
    cr: "no",
    ep: "yes",
    setup: "one-time",
    decrypt: "O(Bmax log Bmax)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "PFE (Boneh et al.)",
    cr: "yes",
    ep: "yes",
    setup: "one-time",
    decrypt: "O(Bmax log Bmax)*",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "BTX",
    cr: "yes",
    ep: "yes",
    setup: "one-time",
    decrypt: "O(B log B)",
    ctxt: "|G₁| + |G_T|",
    highlight: true,
  },
];

export const PROPERTY_EXPLAIN = {
  cr: {
    label: "Collision-free",
    body: "Two users can independently encrypt without coordinating on an index. No censorship via index collision.",
  },
  ep: {
    label: "Epochless",
    body: "A ciphertext isn't bound to a specific block. If it isn't included in block N, it rolls over to N+1.",
  },
  setup: {
    label: "Setup",
    body: "How the reference string and keys scale over time. One-time setup lasts forever. Per-epoch and grows-with-sessions both make long-lived chains awkward.",
  },
  decrypt: {
    label: "Decryption cost",
    body: "How computation scales. O(B log B) tracks the real batch size. O(Bmax) pays for the max, always.",
  },
  ctxt: {
    label: "Ciphertext size",
    body: "Bytes on the wire. Smaller ciphertexts mean less mempool bandwidth and faster propagation.",
  },
} as const;

export interface BenchmarkRow {
  b: number;
  pfePre: number;
  btxPre: number;
  beatPre: number;
  pfeOpen: number;
  btxOpen: number;
  beatOpen: number;
}

export const BENCHMARKS: BenchmarkRow[] = [
  { b: 32, pfePre: 0.963, btxPre: 0.644, beatPre: 0.642, pfeOpen: 0.721, btxOpen: 0.171, beatOpen: 0.171 },
  { b: 64, pfePre: 1.12, btxPre: 0.722, beatPre: 0.722, pfeOpen: 0.721, btxOpen: 0.171, beatOpen: 0.172 },
  { b: 128, pfePre: 1.278, btxPre: 0.801, beatPre: 0.8, pfeOpen: 0.721, btxOpen: 0.171, beatOpen: 0.171 },
  { b: 256, pfePre: 1.436, btxPre: 0.88, beatPre: 0.88, pfeOpen: 0.722, btxOpen: 0.171, beatOpen: 0.171 },
  { b: 512, pfePre: 1.596, btxPre: 0.959, beatPre: 0.96, pfeOpen: 0.723, btxOpen: 0.171, beatOpen: 0.171 },
];

export const PAPER_URL =
  "https://category-labs.github.io/category-research/BTX-paper.pdf";
