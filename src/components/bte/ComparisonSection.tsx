"use client";

import { useInView } from "../useInView";

interface Scheme {
  name: string;
  ref?: string;
  cr: "yes" | "no" | "mixed";
  epochless: "yes" | "no";
  decrypt: string;
  ctxt: string;
  highlight?: boolean;
}

const SCHEMES: Scheme[] = [
  {
    name: "Batched IBE",
    ref: "[1]",
    cr: "mixed",
    epochless: "no",
    decrypt: "O(B log² B)  /  O(Bmax log Bmax)",
    ctxt: "3·|G₁| + |G_T|",
  },
  {
    name: "Fernando et al. (TrX)",
    ref: "[15]",
    cr: "yes",
    epochless: "yes",
    decrypt: "O(B log² B)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "BEAT-MEV",
    ref: "[10]",
    cr: "no",
    epochless: "yes",
    decrypt: "O(B²)",
    ctxt: "3·|G₁| + |G_T|",
  },
  {
    name: "Gong et al.",
    ref: "[19]",
    cr: "mixed",
    epochless: "no",
    decrypt: "O(B log² B)  /  O(Bmax log Bmax)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "BEAT++ (Agarwal et al.)",
    ref: "[1]",
    cr: "no",
    epochless: "yes",
    decrypt: "O(Bmax log Bmax)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "PFE (Boneh et al.)",
    ref: "[7]",
    cr: "yes",
    epochless: "yes",
    decrypt: "O(Bmax log Bmax)",
    ctxt: "2·|G₁| + |G_T|",
  },
  {
    name: "BTX",
    cr: "yes",
    epochless: "yes",
    decrypt: "O(B log B)",
    ctxt: "|G₁| + |G_T|",
    highlight: true,
  },
];

function Check({ value }: { value: "yes" | "no" | "mixed" }) {
  if (value === "yes") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-solution-accent/10 text-solution-accent font-semibold text-xs">
        ✓
      </span>
    );
  }
  if (value === "no") {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-problem-accent/10 text-problem-accent font-semibold text-xs">
        ✗
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-10 h-5 rounded-full bg-border text-text-tertiary font-mono text-[10px]">
      ✓ / ✗
    </span>
  );
}

export default function ComparisonSection() {
  const { ref, isVisible } = useInView(0.1);

  return (
    <section ref={ref} className="py-24 px-6 bg-surface-elevated border-y border-border">
      <div
        className={`max-w-5xl mx-auto section-reveal ${isVisible ? "visible" : ""}`}
      >
        <p className="font-mono text-[11px] text-text-tertiary tracking-widest uppercase mb-3">
          How BTX compares
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Every other BTE scheme trades off
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-4">
          The four properties below each matter for a usable encrypted
          mempool. Every prior scheme drops at least one.
        </p>
        <PropertyKey />

        {/* Desktop table */}
        <div className="mt-8 hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-mono text-[11px] text-text-tertiary uppercase tracking-wider font-normal">
                  Scheme
                </th>
                <th className="text-center py-3 px-3 font-mono text-[11px] text-text-tertiary uppercase tracking-wider font-normal">
                  Collision-free
                </th>
                <th className="text-center py-3 px-3 font-mono text-[11px] text-text-tertiary uppercase tracking-wider font-normal">
                  Epochless
                </th>
                <th className="text-left py-3 px-3 font-mono text-[11px] text-text-tertiary uppercase tracking-wider font-normal">
                  Decryption cost
                </th>
                <th className="text-left py-3 px-3 font-mono text-[11px] text-text-tertiary uppercase tracking-wider font-normal">
                  Ciphertext
                </th>
              </tr>
            </thead>
            <tbody>
              {SCHEMES.map((s) => (
                <tr
                  key={s.name}
                  className={
                    s.highlight
                      ? "bg-solution-bg border-t-2 border-b-2 border-solution-accent/30"
                      : "border-b border-border/50"
                  }
                >
                  <td className="py-3 pr-4">
                    <span
                      className={
                        s.highlight
                          ? "font-semibold text-solution-accent"
                          : "text-text-primary"
                      }
                    >
                      {s.name}
                    </span>
                    {s.ref && (
                      <span className="font-mono text-[10px] text-text-tertiary ml-1.5">
                        {s.ref}
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 px-3">
                    <Check value={s.cr} />
                  </td>
                  <td className="text-center py-3 px-3">
                    <Check value={s.epochless} />
                  </td>
                  <td className="py-3 px-3 font-mono text-[12px] text-text-secondary">
                    {s.decrypt}
                  </td>
                  <td className="py-3 px-3 font-mono text-[12px] text-text-secondary">
                    {s.ctxt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="mt-8 md:hidden space-y-3">
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
                  <Check value={s.cr} />
                  <span className="text-text-tertiary">Collision-free</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check value={s.epochless} />
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

        <p className="font-mono text-[11px] text-text-tertiary mt-5 leading-relaxed">
          B is the actual batch size, Bmax the maximum supported.
          |G₁|, |G_T| refer to the group element sizes of the pairing-friendly
          curve used (BLS12-381 in the implementation). Table reproduced from
          BTX, Table 1.
        </p>
      </div>
    </section>
  );
}

function PropertyKey() {
  const items = [
    {
      label: "Collision-free",
      body: "Two users can independently encrypt without coordinating on an index. No censorship via index collision.",
    },
    {
      label: "Epochless",
      body: "A ciphertext isn't bound to a specific block. If it isn't included in block N, it rolls over to N+1.",
    },
    {
      label: "Decryption cost",
      body: "How computation scales. O(B log B) means it tracks the real batch size. O(Bmax) pays for the max, always.",
    },
    {
      label: "Ciphertext size",
      body: "Bytes on the wire. Smaller ciphertexts mean less mempool bandwidth and faster propagation.",
    },
  ];
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="bg-surface rounded-lg border border-border p-4"
        >
          <p className="font-mono text-[11px] text-text-primary font-semibold mb-1">
            {it.label}
          </p>
          <p className="text-[13px] text-text-secondary leading-relaxed">
            {it.body}
          </p>
        </div>
      ))}
    </div>
  );
}
