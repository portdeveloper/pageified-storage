"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef, useEffect } from "react";
import CodeBlock from "./CodeBlock";
import { useCopyToClipboard } from "./useCopyToClipboard";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

interface QuoteResult {
  output: string;
  minOut: string;
  routerAddress: string;
  gasPrices: Record<string, string>;
}

type Step = "idle" | "authing" | "quoting" | "done";

/* ─── Tokens on Monad mainnet ────────────────────────────────────────── */

const TOKENS: Token[] = [
  { symbol: "MON", name: "Monad", address: "0x0000000000000000000000000000000000000000", decimals: 18 },
  { symbol: "USDC", name: "USD Coin", address: "0x754704Bc059F8C67012fEd69BC8A327a5aafb603", decimals: 6 },
  { symbol: "WETH", name: "Wrapped Ether", address: "0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242", decimals: 18 },
  { symbol: "USDT", name: "Tether USD", address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", decimals: 6 },
  { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", decimals: 8 },
  { symbol: "WMON", name: "Wrapped MON", address: "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A", decimals: 18 },
];

const KURU_API = "https://ws.kuru.io";

/* ─── Aggregators (from Monad docs) ──────────────────────────────────── */

const AGGREGATORS = [
  { id: "kuru", name: "Kuru Flow", ready: true },
  { id: "relay", name: "Relay", ready: false },
  { id: "lifi", name: "Li.Fi", ready: false },
  { id: "squid", name: "Squid", ready: false },
  { id: "bungee", name: "Bungee", ready: false },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatUnits(value: string, decimals: number): string {
  const num = Number(BigInt(value)) / 10 ** decimals;
  if (num < 0.0001) return num.toExponential(2);
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(2);
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function toSmallestUnit(amount: string, decimals: number): string {
  const parts = amount.split(".");
  const integer = parts[0] || "0";
  let fraction = parts[1] || "";
  fraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  const raw = integer + fraction;
  return BigInt(raw).toString();
}

/* ─── Code snippets (from Monad docs Kuru Flow guide) ────────────────── */

function getKuruSnippet(tokenIn: Token, tokenOut: Token, amount: string): string {
  return `import { parseUnits, formatUnits } from "viem";

const KURU_FLOW_API = "https://ws.kuru.io";

// 1. Get JWT token
const authRes = await fetch(\`\${KURU_FLOW_API}/api/generate-token\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user_address: userAddress }),
});
const { token } = await authRes.json();

// 2. Get swap quote: ${amount || "1"} ${tokenIn.symbol} → ${tokenOut.symbol}
const quoteRes = await fetch(\`\${KURU_FLOW_API}/api/quote\`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": \`Bearer \${token}\`,
  },
  body: JSON.stringify({
    userAddress,
    tokenIn: "${tokenIn.address}",
    tokenOut: "${tokenOut.address}",
    amount: parseUnits("${amount || "1"}", ${tokenIn.decimals}).toString(),
    autoSlippage: true,
  }),
});

const quote = await quoteRes.json();
console.log(\`Output: \${formatUnits(BigInt(quote.output), ${tokenOut.decimals})} ${tokenOut.symbol}\`);

// 3. Execute swap (requires connected wallet)
const tx = await walletClient.sendTransaction({
  to: quote.transaction.to,
  data: \`0x\${quote.transaction.calldata}\`,  // Add 0x prefix!
  value: BigInt(quote.transaction.value || "0"),
});`;
}

function getSwapComponentSnippet(tokenIn: Token, tokenOut: Token): string {
  return `// Full swap component with approval flow
// Based on: docs.monad.xyz/guides/kuru-flow

import { useAccount, useSendTransaction, useReadContract } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";

const KURU_API = "https://ws.kuru.io";

const ERC20_ABI = [
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }] },
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }] },
] as const;

export function SwapCard() {
  const { address } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const [quote, setQuote] = useState(null);

  const tokenIn = "${tokenIn.address}";  // ${tokenIn.symbol}
  const tokenOut = "${tokenOut.address}";  // ${tokenOut.symbol}
  const isNative = tokenIn === "0x0000000000000000000000000000000000000000";

  // Check ERC-20 allowance (skip for native MON)
  const { data: allowance } = useReadContract({
    address: tokenIn,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && quote ? [address, quote.transaction.to] : undefined,
    query: { enabled: !isNative && !!quote },
  });

  async function getQuote(amount) {
    // Get JWT
    const auth = await fetch(\`\${KURU_API}/api/generate-token\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_address: address }),
    }).then(r => r.json());

    // Get quote
    const q = await fetch(\`\${KURU_API}/api/quote\`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${auth.token}\`,
      },
      body: JSON.stringify({
        userAddress: address,
        tokenIn, tokenOut,
        amount: parseUnits(amount, ${tokenIn.decimals}).toString(),
        autoSlippage: true,
      }),
    }).then(r => r.json());

    setQuote(q);
  }

  function handleSwap() {
    if (!quote || quote.status !== "success") return;
    const calldata = quote.transaction.calldata.startsWith("0x")
      ? quote.transaction.calldata
      : \`0x\${quote.transaction.calldata}\`;
    sendTransaction({
      to: quote.transaction.to,
      data: calldata,
      value: BigInt(quote.transaction.value || "0"),
    });
  }

  // ... render UI
}`;
}

function getAIPrompt(tokenIn: Token, tokenOut: Token, amount: string): string {
  return `I want to add token swaps to my Monad dapp using Kuru Flow aggregator.

## How Kuru Flow works
1. Get a JWT token: POST ${KURU_API}/api/generate-token
2. Get a swap quote: POST ${KURU_API}/api/quote
3. Check ERC-20 allowance (skip for native MON)
4. Approve if needed
5. Send the transaction with calldata from the quote

## Quick example
${getKuruSnippet(tokenIn, tokenOut, amount)}

## Full component with approval flow
${getSwapComponentSnippet(tokenIn, tokenOut)}

## Token addresses (Monad mainnet)
- MON (native): 0x0000000000000000000000000000000000000000 (18 decimals)
- USDC: 0x754704Bc059F8C67012fEd69BC8A327a5aafb603 (6 decimals)
- WETH: 0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242 (18 decimals)
- USDT: 0xe7cd86e13AC4309349F30B3435a9d337750fC82D (6 decimals)
- WBTC: 0x0555E30da8f98308EdB960aa94C0Db47230d2B9c (8 decimals)
- WMON: 0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A (18 decimals)

## Key details
- IMPORTANT: calldata from quote does NOT have 0x prefix — add it!
- Native MON doesn't need approval, ERC-20 tokens do
- Use autoSlippage: true or set slippageTolerance in basis points
- Router address comes from the quote response (not hardcoded)
- Chain ID: 10143 (Monad mainnet)
- Kuru docs: https://docs.kuru.io/kuru-flow/flow-overview
- Example repo: https://github.com/monad-developers/kuru-flow-api-example

Integrate this into my project following my existing code patterns.`;
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function SwapPlayground() {
  const [tokenInIdx, setTokenInIdx] = useState(0); // MON
  const [tokenOutIdx, setTokenOutIdx] = useState(1); // USDC
  const [amount, setAmount] = useState("1");
  const [step, setStep] = useState<Step>("idle");
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { copied, copy } = useCopyToClipboard();
  const [codeTab, setCodeTab] = useState<"quick" | "component">("quick");
  const [aggregatorId, setAggregatorId] = useState("kuru");
  const [showCode, setShowCode] = useState(false);
  const jwtRef = useRef<{ token: string; expires: number } | null>(null);

  const tokenIn = TOKENS[tokenInIdx];
  const tokenOut = TOKENS[tokenOutIdx];

  // Get JWT on mount (no wallet needed for read-only quotes)
  useEffect(() => {
    fetch(`${KURU_API}/api/generate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_address: "0x0000000000000000000000000000000000000001",
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        jwtRef.current = { token: d.token, expires: d.expires_at };
      })
      .catch((e) => console.warn("Kuru JWT prefetch failed:", e));
  }, []);

  const flipTokens = () => {
    setTokenInIdx(tokenOutIdx);
    setTokenOutIdx(tokenInIdx);
    setQuote(null);
    setStep("idle");
  };

  const getQuote = useCallback(async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStep("authing");
    setError(null);
    setQuote(null);

    try {
      const t0 = performance.now();

      // Ensure we have a valid JWT
      if (
        !jwtRef.current ||
        jwtRef.current.expires * 1000 < Date.now() + 60_000
      ) {
        const authRes = await fetch(`${KURU_API}/api/generate-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_address: "0x0000000000000000000000000000000000000001",
          }),
        });
        const authData = await authRes.json();
        jwtRef.current = { token: authData.token, expires: authData.expires_at };
      }

      setStep("quoting");

      const rawAmount = toSmallestUnit(amount, tokenIn.decimals);

      const quoteRes = await fetch(`${KURU_API}/api/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtRef.current.token}`,
        },
        body: JSON.stringify({
          userAddress: "0x0000000000000000000000000000000000000001",
          tokenIn: tokenIn.address,
          tokenOut: tokenOut.address,
          amount: rawAmount,
          autoSlippage: true,
        }),
      });

      const t1 = performance.now();
      setLatencyMs(Math.round(t1 - t0));

      const data = await quoteRes.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Quote failed");
      }

      setQuote({
        output: data.output,
        minOut: data.minOut,
        routerAddress: data.transaction.to,
        gasPrices: data.gasPrices,
      });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get quote");
      setStep("idle");
    }
  }, [amount, tokenIn, tokenOut]);

  const rate =
    quote && amount
      ? Number(formatUnits(quote.output, tokenOut.decimals).replace(/,/g, "")) /
        parseFloat(amount)
      : null;

  const slippage =
    quote
      ? (
          ((Number(quote.output) - Number(quote.minOut)) / Number(quote.output)) *
          100
        ).toFixed(2)
      : null;

  return (
    <div className="space-y-6">
      {/* Aggregator tabs */}
      <div>
        <p className="font-mono text-[11px] text-text-tertiary mb-3">
          Pick an aggregator
        </p>
        <div className="flex flex-wrap gap-2">
          {AGGREGATORS.map((a) => (
            <button
              key={a.id}
              onClick={() => a.ready && setAggregatorId(a.id)}
              disabled={!a.ready}
              className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                aggregatorId === a.id
                  ? "bg-solution-accent text-white border-solution-accent"
                  : a.ready
                  ? "bg-surface-elevated text-text-secondary border-border hover:border-text-tertiary"
                  : "text-text-tertiary/30 border-border/40 cursor-default"
              }`}
            >
              {a.name}
              {!a.ready && (
                <span className="ml-1.5 text-[10px] opacity-50">soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Swap interface ──────────────────────────────────────── */}
        <div className="bg-surface-elevated rounded-2xl border border-border p-6 space-y-4">
          {/* Token In */}
          <div>
            <p className="font-mono text-[11px] text-text-tertiary mb-2">
              You pay
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  setAmount(v);
                  setQuote(null);
                  setStep("idle");
                }}
                className="flex-1 font-mono text-2xl font-semibold bg-surface rounded-lg border border-border px-3 py-2 text-text-primary placeholder:text-text-tertiary/30 focus:outline-none focus:border-text-tertiary tabular-nums"
                placeholder="0"
              />
              <select
                value={tokenInIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setTokenInIdx(idx);
                  if (idx === tokenOutIdx)
                    setTokenOutIdx(tokenInIdx);
                  setQuote(null);
                  setStep("idle");
                }}
                className="font-mono text-sm bg-surface rounded-lg border border-border px-3 py-2 text-text-primary focus:outline-none focus:border-text-tertiary appearance-none cursor-pointer"
              >
                {TOKENS.map((t, i) => (
                  <option key={t.symbol} value={i}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center">
            <button
              onClick={flipTokens}
              aria-label="Swap token direction"
              className="w-8 h-8 rounded-full border border-border bg-surface hover:bg-border/30 transition-all flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* Token Out */}
          <div>
            <p className="font-mono text-[11px] text-text-tertiary mb-2">
              You receive
            </p>
            <div className="flex gap-2">
              <div className="flex-1 font-mono text-2xl font-semibold bg-surface rounded-lg border border-border px-3 py-2 tabular-nums min-h-[52px] flex items-center">
                <AnimatePresence mode="wait">
                  {step === "done" && quote ? (
                    <motion.span
                      key={quote.output}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-solution-accent"
                    >
                      {formatUnits(quote.output, tokenOut.decimals)}
                    </motion.span>
                  ) : step === "quoting" || step === "authing" ? (
                    <span className="text-text-tertiary/30 text-lg">
                      Getting quote...
                    </span>
                  ) : (
                    <span className="text-text-tertiary/30">0</span>
                  )}
                </AnimatePresence>
              </div>
              <select
                value={tokenOutIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setTokenOutIdx(idx);
                  if (idx === tokenInIdx)
                    setTokenInIdx(tokenOutIdx);
                  setQuote(null);
                  setStep("idle");
                }}
                className="font-mono text-sm bg-surface rounded-lg border border-border px-3 py-2 text-text-primary focus:outline-none focus:border-text-tertiary appearance-none cursor-pointer"
              >
                {TOKENS.map((t, i) => (
                  <option key={t.symbol} value={i}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quote button */}
          <button
            onClick={getQuote}
            disabled={step === "authing" || step === "quoting" || !amount}
            className={`w-full font-mono text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              step === "idle" || step === "done"
                ? "bg-solution-accent text-white hover:bg-solution-accent/90"
                : "bg-solution-accent/50 text-white/60 cursor-default"
            }`}
          >
            {step === "idle" && "Get quote"}
            {step === "authing" && "Authenticating..."}
            {step === "quoting" && "Fetching quote from Kuru..."}
            {step === "done" && (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh quote
              </>
            )}
          </button>

          {error && (
            <p className="font-mono text-xs text-problem-accent">{error}</p>
          )}

          {/* Quote details */}
          <AnimatePresence>
            {step === "done" && quote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="bg-surface rounded-lg border border-border p-3 space-y-1.5">
                  {rate && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-tertiary">Rate</span>
                      <span className="font-mono text-[11px] text-text-primary">
                        1 {tokenIn.symbol} = {rate < 0.0001 ? rate.toExponential(2) : rate < 1 ? rate.toFixed(4) : rate.toFixed(2)} {tokenOut.symbol}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-text-tertiary">Min output</span>
                    <span className="font-mono text-[11px] text-text-primary">
                      {formatUnits(quote.minOut, tokenOut.decimals)} {tokenOut.symbol}
                    </span>
                  </div>
                  {slippage && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[11px] text-text-tertiary">Max slippage</span>
                      <span className="font-mono text-[11px] text-text-primary">{slippage}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-text-tertiary">Router</span>
                    <span className="font-mono text-[11px] text-text-primary">
                      {quote.routerAddress.slice(0, 6)}...{quote.routerAddress.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-text-tertiary">Gas (standard)</span>
                    <span className="font-mono text-[11px] text-text-primary">
                      {quote.gasPrices.standard} gwei
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[11px] text-text-tertiary">Latency</span>
                    <span className="font-mono text-[11px] text-solution-accent">
                      {latencyMs}ms
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <div className="bg-solution-bg/50 rounded-xl p-4 border border-solution-cell">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-mono text-[11px] text-solution-accent font-medium">
                Kuru Flow
              </p>
              <span className="font-mono text-[10px] text-solution-muted bg-solution-cell px-1.5 py-0.5 rounded">
                DEX aggregator
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Kuru Flow finds the best swap route across Monad DEXes.
              Quotes above are <strong>live</strong> from{" "}
              <a
                href="https://docs.kuru.io/kuru-flow/flow-overview"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-primary"
              >
                ws.kuru.io
              </a>
              . Executing a swap requires a connected wallet.
            </p>
          </div>
        </div>

        {/* Mobile code toggle */}
        <button
          onClick={() => setShowCode((s) => !s)}
          className="lg:hidden w-full font-mono text-sm px-4 py-2.5 rounded-xl border border-border bg-surface-elevated text-text-secondary hover:text-text-primary hover:border-text-tertiary transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          {showCode ? "Hide code" : "View code"}
        </button>
        {/* Code panel */}
        <div className={`bg-surface-elevated rounded-2xl border border-border overflow-hidden flex-col ${showCode ? "flex" : "hidden lg:flex"}`}>
          <div className="flex items-center border-b border-border px-4">
            <button
              onClick={() => setCodeTab("quick")}
              className={`font-mono text-xs px-3 py-3 border-b-2 transition-all ${
                codeTab === "quick"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Quick start
            </button>
            <button
              onClick={() => setCodeTab("component")}
              className={`font-mono text-xs px-3 py-3 border-b-2 transition-all ${
                codeTab === "component"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Full component
            </button>
            <div className="flex-1" />
            <button
              onClick={() =>
                copy(
                  codeTab === "quick"
                    ? getKuruSnippet(tokenIn, tokenOut, amount)
                    : getSwapComponentSnippet(tokenIn, tokenOut),
                  "code"
                )
              }
              aria-label="Copy code snippet"
              className="font-mono text-[11px] text-text-tertiary hover:text-text-primary transition-colors px-2 py-1"
            >
              {copied === "code" ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5 max-h-80 lg:max-h-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${tokenInIdx}-${tokenOutIdx}-${amount}-${codeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CodeBlock
                  code={codeTab === "quick"
                    ? getKuruSnippet(tokenIn, tokenOut, amount)
                    : getSwapComponentSnippet(tokenIn, tokenOut)}
                  language="javascript"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-t border-border p-4">
            <button
              onClick={() =>
                copy(getAIPrompt(tokenIn, tokenOut, amount), "ai")
              }
              className="w-full font-mono text-sm px-4 py-3.5 rounded-xl bg-text-primary text-surface border border-solution-accent/30 hover:border-solution-accent/60 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied === "ai"
                ? "Copied! Paste into your AI assistant"
                : "Copy for AI — Kuru Flow + full swap setup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
