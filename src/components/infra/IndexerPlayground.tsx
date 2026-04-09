"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface EventLog {
  address: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  txHash: string;
}

type Step = "idle" | "fetching" | "decoding" | "done";

/* ─── Providers (from Monad docs) ────────────────────────────────────── */

const FRAMEWORKS = [
  { id: "envio", name: "Envio", ready: false },
  { id: "thegraph", name: "The Graph", ready: false },
  { id: "goldsky", name: "Goldsky", ready: false },
  { id: "ghost", name: "Ghost", ready: false },
  { id: "sentio", name: "Sentio", ready: false },
  { id: "sqd", name: "SQD", ready: false },
  { id: "subquery", name: "SubQuery", ready: false },
  { id: "streamingfast", name: "Streamingfast", ready: false },
];

/* ─── Event types ────────────────────────────────────────────────────── */

const EVENT_TYPES = [
  {
    id: "transfer",
    label: "ERC-20 Transfer",
    topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    signature: "Transfer(address indexed from, address indexed to, uint256 value)",
  },
  {
    id: "approval",
    label: "ERC-20 Approval",
    topic: "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
    signature: "Approval(address indexed owner, address indexed spender, uint256 value)",
  },
];

const BLOCK_RANGES = [
  { label: "Last 5 blocks", value: 5 },
  { label: "Last 20 blocks", value: 20 },
  { label: "Last 100 blocks", value: 100 },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */

const RPC_URL = "https://rpc.monad.xyz";

function shortenAddr(addr: string): string {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatValue(hex: string): string {
  const raw = BigInt(hex || "0x0");
  // Try to show as 18-decimal token
  const asEther = Number(raw) / 1e18;
  if (asEther >= 0.001) return asEther.toFixed(4);
  // Try 6-decimal (USDC-like)
  const as6 = Number(raw) / 1e6;
  if (as6 >= 0.001) return as6.toFixed(2);
  return raw.toString();
}

/* ─── Code snippets ──────────────────────────────────────────────────── */

function getViemSnippet(eventType: typeof EVENT_TYPES[0], blockRange: number): string {
  const isTransfer = eventType.id === "transfer";
  return `import { createPublicClient, http, parseAbiItem } from "viem";

const client = createPublicClient({
  chain: { id: 10143, name: "Monad", nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 }, rpcUrls: { default: { http: ["https://rpc.monad.xyz"] } } },
  transport: http(),
});

const blockNumber = await client.getBlockNumber();

// Query ${eventType.label} events from the last ${blockRange} blocks
const logs = await client.getLogs({
  event: parseAbiItem(
    "event ${eventType.signature}"
  ),
  fromBlock: blockNumber - ${blockRange}n,
  toBlock: blockNumber,
});

for (const log of logs) {
  console.log({
    contract: log.address,
    ${isTransfer ? "from: log.args.from," : "owner: log.args.owner,"}
    ${isTransfer ? "to: log.args.to," : "spender: log.args.spender,"}
    ${isTransfer ? "value: log.args.value," : "value: log.args.value,"}
    block: log.blockNumber,
  });
}

console.log(\`Found \${logs.length} events\`);`;
}

function getEnvioSnippet(eventType: typeof EVENT_TYPES[0]): string {
  const isTransfer = eventType.id === "transfer";
  return `// config.yaml — Envio HyperIndex configuration
name: monad-${eventType.id}-indexer
description: Index ${eventType.label} events on Monad
networks:
  - id: 10143
    start_block: 0
    contracts:
      - name: ERC20
        address:
          - "0x..." # your token contract
        handler: src/EventHandlers.ts
        events:
          - event: "${eventType.signature}"

// src/EventHandlers.ts
import { ERC20 } from "generated";

ERC20.${isTransfer ? "Transfer" : "Approval"}.handler(async ({ event, context }) => {
  const entity = {
    id: event.transaction.hash + "-" + event.logIndex,
    ${isTransfer ? "from: event.params.from," : "owner: event.params.owner,"}
    ${isTransfer ? "to: event.params.to," : "spender: event.params.spender,"}
    value: event.params.value,
    blockNumber: event.block.number,
    timestamp: event.block.timestamp,
  };
  context.${isTransfer ? "Transfer" : "Approval"}.set(entity);
});

// Query via GraphQL after indexing:
// { transfers(first: 10, orderBy: "blockNumber", orderDirection: "desc") {
//     from to value blockNumber
// } }`;
}

function getAIPrompt(eventType: typeof EVENT_TYPES[0], blockRange: number): string {
  return `I want to index ${eventType.label} events on Monad.

## Quick start — raw RPC with viem
${getViemSnippet(eventType, blockRange)}

## Production — use an indexing framework

### Envio HyperIndex (recommended)
- Hosted indexing with GraphQL API
- HyperSync endpoint: https://monad.hypersync.xyz (mainnet)
- Docs: https://docs.envio.dev/

### The Graph
- Decentralized subgraph protocol
- AssemblyScript mappings
- Docs: https://thegraph.com/docs/

### Goldsky
- Subgraphs + Mirror (streaming pipelines)
- Real-time data streaming
- Docs: https://docs.goldsky.com/

### Other frameworks on Monad
- Ghost (Solidity-based indexer): https://docs.ghost.ac/
- Sentio (integrated alerting): https://docs.sentio.xyz/
- SQD (squid-sdk, TypeScript): https://docs.sqd.ai/
- SubQuery (decentralized, TypeScript): https://academy.subquery.network/
- Streamingfast (Substreams, Rust): https://substreams.streamingfast.io/

## Key details
- Monad mainnet chain ID: 10143
- RPC: https://rpc.monad.xyz
- ERC-20 Transfer topic: ${EVENT_TYPES[0].topic}
- ERC-20 Approval topic: ${EVENT_TYPES[1].topic}
- For production, use an indexing framework instead of raw eth_getLogs
  (handles reorgs, pagination, and historical backfill)

Integrate this into my project following my existing code patterns.`;
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function IndexerPlayground() {
  const [eventType, setEventType] = useState(0);
  const [blockRange, setBlockRange] = useState(1); // index into BLOCK_RANGES
  const [step, setStep] = useState<Step>("idle");
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [latencyMs, setLatencyMs] = useState(0);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [codeTab, setCodeTab] = useState<"viem" | "envio">("viem");

  const evt = EVENT_TYPES[eventType];
  const range = BLOCK_RANGES[blockRange];

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const runQuery = useCallback(async () => {
    setStep("fetching");
    setError(null);
    setLogs([]);
    setRevealIndex(-1);
    setTotalCount(0);

    try {
      const t0 = performance.now();

      // Get latest block
      const blockRes = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });
      const blockData = await blockRes.json();
      const latest = parseInt(blockData.result, 16);
      const from = latest - range.value;

      // Query logs
      const logsRes = await fetch(RPC_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getLogs",
          params: [
            {
              fromBlock: "0x" + from.toString(16),
              toBlock: "0x" + latest.toString(16),
              topics: [evt.topic],
            },
          ],
          id: 2,
        }),
      });

      const t1 = performance.now();
      setLatencyMs(Math.round(t1 - t0));

      const logsData = await logsRes.json();
      if (logsData.error) throw new Error(logsData.error.message);

      const rawLogs = logsData.result as Array<{
        address: string;
        topics: string[];
        data: string;
        blockNumber: string;
        transactionHash: string;
      }>;

      setTotalCount(rawLogs.length);

      // Decode top 10
      const decoded: EventLog[] = rawLogs.slice(0, 12).map((log) => ({
        address: log.address,
        from: log.topics[1] ? "0x" + log.topics[1].slice(26) : "?",
        to: log.topics[2] ? "0x" + log.topics[2].slice(26) : "?",
        value: formatValue(log.data),
        blockNumber: parseInt(log.blockNumber, 16),
        txHash: log.transactionHash,
      }));

      setLogs(decoded);
      setStep("decoding");

      // Reveal rows one by one
      for (let i = 0; i < decoded.length; i++) {
        await new Promise((r) => setTimeout(r, 120));
        setRevealIndex(i);
      }

      await new Promise((r) => setTimeout(r, 300));
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed");
      setStep("idle");
    }
  }, [evt.topic, range.value]);

  return (
    <div className="space-y-6">
      {/* Framework tabs */}
      <div>
        <p className="font-mono text-[11px] text-text-tertiary mb-3">
          Indexing frameworks on Monad
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="font-mono text-xs px-3 py-1.5 rounded-lg border bg-solution-accent text-white border-solution-accent"
          >
            eth_getLogs
          </button>
          {FRAMEWORKS.map((f) => (
            <button
              key={f.id}
              disabled
              className="font-mono text-xs px-3 py-1.5 rounded-lg border text-text-tertiary/30 border-border/40 cursor-default"
            >
              {f.name}
              <span className="ml-1.5 text-[10px] opacity-50">soon</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Query builder + results ─────────────────────────────── */}
        <div className="bg-surface-elevated rounded-2xl border border-border p-6 space-y-5">
          {/* Event type picker */}
          <div>
            <p className="font-mono text-[11px] text-text-tertiary mb-3">
              Event type
            </p>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => {
                    setEventType(i);
                    setStep("idle");
                    setLogs([]);
                  }}
                  className={`font-mono text-sm px-3 py-2 rounded-lg border transition-all ${
                    eventType === i
                      ? "bg-text-primary text-surface border-text-primary"
                      : "bg-surface text-text-secondary border-border hover:border-text-tertiary"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Block range picker */}
          <div>
            <p className="font-mono text-[11px] text-text-tertiary mb-3">
              Block range
            </p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_RANGES.map((r, i) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setBlockRange(i);
                    setStep("idle");
                    setLogs([]);
                  }}
                  className={`font-mono text-sm px-3 py-2 rounded-lg border transition-all ${
                    blockRange === i
                      ? "bg-text-primary text-surface border-text-primary"
                      : "bg-surface text-text-secondary border-border hover:border-text-tertiary"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Query button */}
          <button
            onClick={runQuery}
            disabled={step === "fetching" || step === "decoding"}
            className={`w-full font-mono text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              step === "idle" || step === "done"
                ? "bg-solution-accent text-white hover:bg-solution-accent/90"
                : "bg-solution-accent/50 text-white/60 cursor-default"
            }`}
          >
            {step === "idle" && (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Query Monad
              </>
            )}
            {step === "fetching" && "Querying rpc.monad.xyz..."}
            {step === "decoding" && `Decoding ${totalCount} events...`}
            {step === "done" && (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Query again
              </>
            )}
          </button>

          {/* Results summary */}
          {step === "done" && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-text-secondary">
                {totalCount} events found
              </span>
              <span className="font-mono text-[10px] text-solution-accent">
                {latencyMs}ms
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="font-mono text-xs text-problem-accent">{error}</p>
          )}

          {/* Results table */}
          <AnimatePresence>
            {logs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-x-auto"
              >
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="font-mono text-[10px] text-text-tertiary text-left py-2 pr-3">Block</th>
                      <th className="font-mono text-[10px] text-text-tertiary text-left py-2 pr-3">
                        {eventType === 0 ? "From" : "Owner"}
                      </th>
                      <th className="font-mono text-[10px] text-text-tertiary text-left py-2 pr-3">
                        {eventType === 0 ? "To" : "Spender"}
                      </th>
                      <th className="font-mono text-[10px] text-text-tertiary text-right py-2 pr-3">Value</th>
                      <th className="font-mono text-[10px] text-text-tertiary text-left py-2">Contract</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <AnimatePresence key={log.txHash + i}>
                        {i <= revealIndex && (
                          <motion.tr
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.15 }}
                            className="border-b border-border/50 hover:bg-surface/50"
                          >
                            <td className="font-mono text-[11px] text-text-secondary py-1.5 pr-3 tabular-nums">
                              {log.blockNumber}
                            </td>
                            <td className="font-mono text-[11px] text-text-primary py-1.5 pr-3">
                              {shortenAddr(log.from)}
                            </td>
                            <td className="font-mono text-[11px] text-text-primary py-1.5 pr-3">
                              {shortenAddr(log.to)}
                            </td>
                            <td className="font-mono text-[11px] text-solution-accent py-1.5 pr-3 text-right tabular-nums">
                              {log.value}
                            </td>
                            <td className="font-mono text-[11px] text-text-tertiary py-1.5">
                              {shortenAddr(log.address)}
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    ))}
                  </tbody>
                </table>
                {totalCount > 12 && step === "done" && (
                  <p className="font-mono text-[10px] text-text-tertiary mt-2">
                    Showing 12 of {totalCount} events
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <div className="bg-solution-bg/50 rounded-xl p-4 border border-solution-cell">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-mono text-[11px] text-solution-accent font-medium">
                How event indexing works
              </p>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">eth_getLogs</code>{" "}
              queries the blockchain for events matching a topic filter.
              This works for small ranges, but for production use an indexing
              framework like Envio, The Graph, or Goldsky — they handle reorgs,
              pagination, and historical backfill.
            </p>
          </div>
        </div>

        {/* ── Right: Code panel ────────────────────────────────────────── */}
        <div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden flex flex-col">
          {/* Code tabs */}
          <div className="flex items-center border-b border-border px-4">
            <button
              onClick={() => setCodeTab("viem")}
              className={`font-mono text-xs px-3 py-3 border-b-2 transition-all ${
                codeTab === "viem"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              viem
            </button>
            <button
              onClick={() => setCodeTab("envio")}
              className={`font-mono text-xs px-3 py-3 border-b-2 transition-all ${
                codeTab === "envio"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Envio
            </button>
            <div className="flex-1" />
            <button
              onClick={() =>
                copyToClipboard(
                  codeTab === "viem"
                    ? getViemSnippet(evt, range.value)
                    : getEnvioSnippet(evt),
                  "code"
                )
              }
              className="font-mono text-[11px] text-text-tertiary hover:text-text-primary transition-colors px-2 py-1"
            >
              {copied === "code" ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Code block */}
          <div className="flex-1 overflow-auto p-5">
            <AnimatePresence mode="wait">
              <motion.pre
                key={`${eventType}-${codeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[13px] leading-relaxed text-text-primary whitespace-pre-wrap break-words"
              >
                {codeTab === "viem"
                  ? getViemSnippet(evt, range.value)
                  : getEnvioSnippet(evt)}
              </motion.pre>
            </AnimatePresence>
          </div>

          {/* Copy for AI button */}
          <div className="border-t border-border p-4">
            <button
              onClick={() => copyToClipboard(getAIPrompt(evt, range.value), "ai")}
              className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-text-primary text-surface hover:bg-text-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied === "ai"
                ? "Copied! Paste into your AI assistant"
                : "Copy for AI — viem + Envio + all frameworks"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
