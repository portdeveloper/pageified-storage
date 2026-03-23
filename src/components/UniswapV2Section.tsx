"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useInView } from "./useInView";

const COLD_COST = 8100;
const WARM_COST = 100;

// Uniswap V2 Pair storage layout (inherits UniswapV2ERC20)
// Slots 0–4 are ERC20 state (totalSupply, balanceOf mapping, allowance mapping, DOMAIN_SEPARATOR, nonces mapping)
// Slots 5–12 are the Pair-specific state
const STORAGE_SLOTS = [
  { slot: 0, name: "totalSupply", type: "uint256", accessed: false },
  { slot: 1, name: "balanceOf", type: "mapping", accessed: false },
  { slot: 2, name: "allowance", type: "mapping", accessed: false },
  { slot: 3, name: "DOMAIN_SEPARATOR", type: "bytes32", accessed: false },
  { slot: 4, name: "nonces", type: "mapping", accessed: false },
  { slot: 5, name: "factory", type: "address", accessed: true },
  { slot: 6, name: "token0", type: "address", accessed: true },
  { slot: 7, name: "token1", type: "address", accessed: true },
  { slot: 8, name: "reserve0 | reserve1 | blockTimestampLast", type: "packed", accessed: true },
  { slot: 9, name: "price0CumulativeLast", type: "uint256", accessed: true },
  { slot: 10, name: "price1CumulativeLast", type: "uint256", accessed: true },
  { slot: 11, name: "kLast", type: "uint256", accessed: true },
  { slot: 12, name: "unlocked", type: "uint256", accessed: true },
];

const ACCESSED_SLOTS = STORAGE_SLOTS.filter((s) => s.accessed);

// The execution steps of swap(), in order
const SWAP_STEPS = [
  { slot: 12, label: "lock modifier", detail: "read unlocked (reentrancy guard)" },
  { slot: 8, label: "getReserves()", detail: "read reserve0, reserve1, blockTimestampLast" },
  { slot: 6, label: "swap()", detail: "read token0 address for balance check" },
  { slot: 7, label: "swap()", detail: "read token1 address for balance check" },
  { slot: 5, label: "_mintFee()", detail: "read factory address" },
  { slot: 11, label: "_mintFee()", detail: "read kLast for fee calculation" },
  { slot: 9, label: "_update()", detail: "read/write price0CumulativeLast" },
  { slot: 10, label: "_update()", detail: "read/write price1CumulativeLast" },
];

export default function UniswapV2Section() {
  const { ref, isVisible } = useInView(0.1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [touchedSlots, setTouchedSlots] = useState<Set<number>>(new Set());
  const [pageWarmed, setPageWarmed] = useState(false);
  const [currentGas, setCurrentGas] = useState(0);
  const [mip8Gas, setMip8Gas] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStepIndex(-1);
    setTouchedSlots(new Set());
    setPageWarmed(false);
    setCurrentGas(0);
    setMip8Gas(0);
    setIsPlaying(false);
    setLastAction(null);
  }, []);

  const executeStep = useCallback(
    (idx: number, prevTouched: Set<number>, prevPageWarmed: boolean, prevCurrentGas: number, prevMip8Gas: number) => {
      if (idx >= SWAP_STEPS.length) {
        setIsPlaying(false);
        return;
      }

      const step = SWAP_STEPS[idx];
      const isFirstTouch = !prevTouched.has(step.slot);
      const newTouched = new Set(prevTouched);

      let addedCurrentGas = 0;
      let addedMip8Gas = 0;

      if (isFirstTouch) {
        newTouched.add(step.slot);
        // Current EVM: every new slot is a cold read
        addedCurrentGas = COLD_COST;

        // MIP-8: first slot in the page is cold, rest are warm
        if (!prevPageWarmed) {
          addedMip8Gas = COLD_COST;
        } else {
          addedMip8Gas = WARM_COST;
        }
      }

      const newCurrentGas = prevCurrentGas + addedCurrentGas;
      const newMip8Gas = prevMip8Gas + addedMip8Gas;
      const newPageWarmed = true;

      setStepIndex(idx);
      setTouchedSlots(newTouched);
      setPageWarmed(newPageWarmed);
      setCurrentGas(newCurrentGas);
      setMip8Gas(newMip8Gas);

      if (isFirstTouch) {
        const costLabel = !prevPageWarmed
          ? `cold (${COLD_COST})`
          : `warm (${WARM_COST})`;
        setLastAction(
          `${step.label}: ${step.detail} → MIP-8: ${costLabel}`
        );
      } else {
        setLastAction(`${step.label}: ${step.detail} → already warm`);
      }

      setTimeout(() => {
        executeStep(idx + 1, newTouched, newPageWarmed, newCurrentGas, newMip8Gas);
      }, 600);
    },
    []
  );

  const handlePlay = useCallback(() => {
    reset();
    setIsPlaying(true);
    setTimeout(() => {
      executeStep(0, new Set(), false, 0, 0);
    }, 300);
  }, [reset, executeStep]);

  const finished = stepIndex >= SWAP_STEPS.length - 1 && stepIndex >= 0;
  const savings =
    currentGas > 0
      ? Math.round(((currentGas - mip8Gas) / currentGas) * 100)
      : 0;

  return (
    <section ref={ref} className="py-24 px-6 bg-surface relative">
      <div
        className={`max-w-5xl mx-auto section-reveal ${
          isVisible ? "visible" : ""
        }`}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-solution-muted uppercase mb-3">
          Real-world example
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
          Uniswap V2 Pair: zero changes needed
        </h2>
        <p className="text-lg text-text-secondary font-light max-w-3xl leading-relaxed mb-2">
          The most-forked DEX contract in DeFi. Every <code className="font-mono text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border">swap()</code> touches
          8 storage slots that all sit within a single 128-slot page.
        </p>
        <p className="text-sm text-text-tertiary font-light max-w-3xl leading-relaxed mb-10">
          Under MIP-8, the first slot access warms the entire page. The
          remaining 7 reads become warm automatically. No contract changes, no redeployment.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left: Storage layout */}
          <div>
            <p className="font-mono text-xs text-text-tertiary mb-3 uppercase tracking-wider">
              Storage layout
            </p>
            <div className="bg-surface-elevated rounded-xl border border-border p-4 font-mono text-sm">
              <p className="text-text-tertiary text-xs mb-3">
                {"// UniswapV2Pair.sol, all slots fit in page 0"}
              </p>
              {STORAGE_SLOTS.map((s) => {
                const isTouched = touchedSlots.has(s.slot);
                const isCurrentStep =
                  stepIndex >= 0 &&
                  stepIndex < SWAP_STEPS.length &&
                  SWAP_STEPS[stepIndex].slot === s.slot;

                return (
                  <div
                    key={s.slot}
                    className={`flex items-center gap-3 py-1.5 px-2 rounded transition-all duration-300 ${
                      isCurrentStep
                        ? "bg-solution-accent/10"
                        : isTouched
                        ? "bg-solution-accent-light/40"
                        : ""
                    }`}
                  >
                    <span className="text-text-tertiary w-12 text-right text-xs tabular-nums shrink-0">
                      slot {s.slot}
                    </span>
                    <span
                      className={`transition-colors duration-300 ${
                        isTouched
                          ? "text-solution-accent font-semibold"
                          : s.accessed
                          ? "text-text-primary"
                          : "text-text-tertiary"
                      }`}
                    >
                      {s.name}
                    </span>
                    {isTouched && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-solution-accent text-white shrink-0"
                      >
                        {!pageWarmed && touchedSlots.size === 1 && isTouched
                          ? "COLD"
                          : "WARM"}
                      </motion.span>
                    )}
                    {!isTouched && pageWarmed && s.accessed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-solution-accent-light text-solution-accent shrink-0"
                      >
                        page warm
                      </motion.span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Page visualization + controls */}
          <div>
            <p className="font-mono text-xs text-text-tertiary mb-3 uppercase tracking-wider">
              Page 0 (128 slots)
            </p>
            <div
              className={`bg-surface-elevated rounded-xl p-4 border-2 border-dashed transition-all duration-500 mb-4 ${
                pageWarmed ? "border-solution-accent" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <p className="font-mono text-[10px] text-text-tertiary">
                  page = slot &gt;&gt; 7 = 0
                </p>
                {pageWarmed && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-solution-accent text-white"
                  >
                    WARM
                  </motion.span>
                )}
              </div>
              <div
                className="grid gap-[2px]"
                style={{
                  gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
                }}
              >
                {Array.from({ length: 128 }, (_, i) => {
                  const isTouched = touchedSlots.has(i);
                  const isAccessed = STORAGE_SLOTS.some(
                    (s) => s.slot === i && s.accessed
                  );
                  const isCurrentStep =
                    stepIndex >= 0 &&
                    stepIndex < SWAP_STEPS.length &&
                    SWAP_STEPS[stepIndex].slot === i;

                  let bg = "bg-[#e8e2da]";
                  if (isCurrentStep) bg = "bg-solution-accent animate-pulse";
                  else if (isTouched) bg = "bg-solution-accent";
                  else if (isAccessed && pageWarmed)
                    bg = "bg-solution-accent-light";
                  else if (pageWarmed) bg = "bg-solution-accent-light/50";

                  return (
                    <motion.div
                      key={i}
                      className={`aspect-square rounded-[2px] ${bg}`}
                      transition={{
                        delay: pageWarmed && !isTouched ? i * 0.002 : 0,
                        duration: 0.3,
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="font-mono text-[10px] text-text-tertiary">
                  slots 0–127
                </p>
                <p className="font-mono text-[10px] text-text-tertiary">
                  {touchedSlots.size} of 8 slots accessed
                </p>
              </div>
            </div>

            {/* Play button */}
            <button
              onClick={handlePlay}
              disabled={isPlaying}
              className={`w-full font-mono text-sm px-4 py-3 rounded-lg border transition-all mb-4 ${
                isPlaying
                  ? "bg-surface-elevated border-border text-text-tertiary cursor-default"
                  : "bg-solution-accent text-white border-solution-accent hover:bg-solution-accent/90 cursor-pointer"
              }`}
            >
              {isPlaying
                ? "Executing swap()..."
                : finished
                ? "Replay swap()"
                : "Execute swap()"}
            </button>

            {/* Step log */}
            <AnimatePresence mode="wait">
              {lastAction && (
                <motion.div
                  key={lastAction}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="font-mono text-xs text-solution-accent mb-4 px-1"
                >
                  → {lastAction}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Gas comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Current EVM */}
          <div className="bg-problem-bg rounded-xl border border-problem-cell-hover p-6">
            <p className="font-mono text-xs text-problem-muted uppercase tracking-wider mb-4">
              Current EVM
            </p>
            <motion.p
              key={`current-${currentGas}`}
              initial={{ scale: currentGas > 0 ? 1.1 : 1 }}
              animate={{ scale: 1 }}
              className="font-mono text-4xl font-semibold text-problem-accent tabular-nums mb-2"
            >
              {currentGas > 0 ? currentGas.toLocaleString() : "-"}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary">gas (cold access only)</p>
            {finished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-problem-cell-hover"
              >
                <p className="font-mono text-xs text-text-secondary">
                  {ACCESSED_SLOTS.length} × 8,100 = {(ACCESSED_SLOTS.length * COLD_COST).toLocaleString()} gas
                </p>
                <p className="font-mono text-[10px] text-text-tertiary mt-1">
                  Every slot is a separate cold read on Monad (8,100 gas per cold SLOAD)
                </p>
              </motion.div>
            )}
          </div>

          {/* MIP-8 */}
          <div className="bg-solution-bg rounded-xl border border-solution-accent-light p-6">
            <p className="font-mono text-xs text-solution-muted uppercase tracking-wider mb-4">
              MIP-8
            </p>
            <motion.p
              key={`mip8-${mip8Gas}`}
              initial={{ scale: mip8Gas > 0 ? 1.1 : 1 }}
              animate={{ scale: 1 }}
              className="font-mono text-4xl font-semibold text-solution-accent tabular-nums mb-2"
            >
              {mip8Gas > 0 ? mip8Gas.toLocaleString() : "-"}
            </motion.p>
            <p className="font-mono text-xs text-text-tertiary">gas (cold access only)</p>
            {finished && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-solution-accent-light"
              >
                <p className="font-mono text-xs text-text-secondary">
                  1 × 8,100 + {ACCESSED_SLOTS.length - 1} × 100 = {(COLD_COST + (ACCESSED_SLOTS.length - 1) * WARM_COST).toLocaleString()} gas
                </p>
                <p className="font-mono text-[10px] text-text-tertiary mt-1">
                  One cold page touch, then {ACCESSED_SLOTS.length - 1} warm reads in the same page
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Savings bar */}
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-elevated rounded-lg border border-border p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-xs text-text-tertiary">
                Cold-access gas savings on swap()
              </p>
              <motion.p
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-mono text-lg font-semibold text-solution-accent"
              >
                {savings}% cheaper
              </motion.p>
            </div>
            <div className="w-full h-3 bg-problem-cell rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${100 - savings}%` }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full bg-solution-accent rounded-full"
              />
            </div>
            <div className="flex justify-between mt-1 font-mono text-[10px] text-text-tertiary">
              <span>MIP-8: {mip8Gas.toLocaleString()}</span>
              <span>Current: {currentGas.toLocaleString()}</span>
            </div>
            <p className="font-mono text-[10px] text-text-tertiary mt-3">
              Savings shown are for the cold-access component of SLOAD gas only,
              using Monad gas constants (8,100 cold / 100 warm).
              Actual swap() gas includes execution, memory, calldata, and external calls beyond storage reads.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
