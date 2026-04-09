"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

type Step = "idle" | "request" | "response" | "decode" | "done";

interface DecodedField {
  name: string;
  hex: string;
  value: string;
  highlight?: boolean;
}

interface Props {
  symbol: string;
  address: string;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const RPC_URL = "https://rpc.monad.xyz";
const SELECTOR = "0xfeaf968c"; // latestRoundData()
const DECIMALS_SELECTOR = "0x313ce567"; // decimals()

/* ─── Helpers ────────────────────────────────────────────────────────── */

function hexToInt(hex: string): bigint {
  return BigInt("0x" + hex);
}

function formatPrice(raw: bigint, decimals: number): string {
  const num = Number(raw) / 10 ** decimals;
  if (num < 10) return `$${num.toFixed(4)}`;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTimestamp(ts: bigint): string {
  return new Date(Number(ts) * 1000).toLocaleString();
}

/* ─── Component ──────────────────────────────────────────────────────── */

export default function OnChainCall({ symbol, address }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [rawHex, setRawHex] = useState("");
  const [decoded, setDecoded] = useState<DecodedField[]>([]);
  const [decodeIndex, setDecodeIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);

  const rpcPayload = JSON.stringify(
    {
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: address, data: SELECTOR }, "latest"],
      id: 1,
    },
    null,
    2
  );

  const runCall = useCallback(async () => {
    setStep("request");
    setError(null);
    setDecoded([]);
    setDecodeIndex(-1);
    setRawHex("");

    // Small pause so user can see the request
    await new Promise((r) => setTimeout(r, 800));

    try {
      const t0 = performance.now();

      // Fetch both latestRoundData and decimals
      const [res, decRes] = await Promise.all([
        fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{ to: address, data: SELECTOR }, "latest"],
            id: 1,
          }),
        }),
        fetch(RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{ to: address, data: DECIMALS_SELECTOR }, "latest"],
            id: 2,
          }),
        }),
      ]);

      const t1 = performance.now();
      setLatencyMs(Math.round(t1 - t0));

      const data = await res.json();
      const decData = await decRes.json();

      if (data.error) throw new Error(data.error.message);
      if (decData.error) throw new Error(decData.error.message);

      const hex = data.result as string;
      const decimals = Number(BigInt(decData.result));

      setRawHex(hex);
      setStep("response");

      // Pause to show raw hex
      await new Promise((r) => setTimeout(r, 1000));

      // Decode fields
      const stripped = hex.slice(2);
      const words = Array.from({ length: 5 }, (_, i) =>
        stripped.slice(i * 64, (i + 1) * 64)
      );

      const roundId = hexToInt(words[0]);
      const answer = hexToInt(words[1]);
      const startedAt = hexToInt(words[2]);
      const updatedAt = hexToInt(words[3]);
      const answeredInRound = hexToInt(words[4]);

      const fields: DecodedField[] = [
        {
          name: "roundId",
          hex: "0x" + words[0],
          value: roundId.toString(),
        },
        {
          name: "answer",
          hex: "0x" + words[1],
          value: `${answer.toString()} → ${formatPrice(answer, decimals)}`,
          highlight: true,
        },
        {
          name: "startedAt",
          hex: "0x" + words[2],
          value: formatTimestamp(startedAt),
        },
        {
          name: "updatedAt",
          hex: "0x" + words[3],
          value: formatTimestamp(updatedAt),
        },
        {
          name: "answeredInRound",
          hex: "0x" + words[4],
          value: answeredInRound.toString(),
        },
      ];

      setDecoded(fields);
      setStep("decode");

      // Reveal fields one by one
      for (let i = 0; i < fields.length; i++) {
        await new Promise((r) => setTimeout(r, 500));
        setDecodeIndex(i);
      }

      await new Promise((r) => setTimeout(r, 400));
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "RPC call failed");
      setStep("idle");
    }
  }, [address]);

  return (
    <div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              step === "idle"
                ? "bg-text-tertiary/30"
                : step === "done"
                ? "bg-solution-accent"
                : "bg-problem-accent animate-pulse"
            }`}
          />
          <span className="font-mono text-xs text-text-secondary">
            Live on-chain call
          </span>
          <span className="font-mono text-[10px] text-text-tertiary">
            rpc.monad.xyz
          </span>
        </div>
        {latencyMs > 0 && step === "done" && (
          <span className="font-mono text-[10px] text-solution-accent">
            {latencyMs}ms
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Step 1: JSON-RPC request */}
        <div>
          <p className="font-mono text-[10px] text-text-tertiary mb-2 uppercase tracking-wider">
            eth_call → {symbol}/USD
          </p>
          <div className="bg-surface rounded-lg border border-border p-3 overflow-x-auto">
            <pre className="font-mono text-[12px] text-text-secondary whitespace-pre leading-relaxed">
              {`POST ${RPC_URL}\n`}
              <span
                className={
                  step !== "idle" ? "text-text-primary" : "text-text-tertiary/50"
                }
              >
                {rpcPayload}
              </span>
            </pre>
          </div>
        </div>

        {/* Step 2: Raw hex response */}
        <AnimatePresence>
          {(step === "response" || step === "decode" || step === "done") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-mono text-[10px] text-text-tertiary mb-2 uppercase tracking-wider">
                Raw response &middot; 160 bytes
              </p>
              <div className="bg-surface rounded-lg border border-border p-3 overflow-x-auto">
                <pre className="font-mono text-[11px] leading-relaxed break-all whitespace-pre-wrap">
                  {/* Color-code the 32-byte words */}
                  <span className="text-text-tertiary">0x</span>
                  {rawHex.length > 2 &&
                    Array.from({ length: 5 }, (_, i) => {
                      const word = rawHex.slice(2 + i * 64, 2 + (i + 1) * 64);
                      const isRevealed =
                        step === "decode" || step === "done"
                          ? i <= decodeIndex
                          : false;
                      const isAnswer = i === 1;
                      return (
                        <span
                          key={i}
                          className={`transition-colors duration-300 ${
                            isRevealed && isAnswer
                              ? "text-solution-accent font-medium"
                              : isRevealed
                              ? "text-text-primary"
                              : "text-text-tertiary/60"
                          }`}
                        >
                          {word}
                        </span>
                      );
                    })}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Decoded fields */}
        <AnimatePresence>
          {(step === "decode" || step === "done") && decoded.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5"
            >
              <p className="font-mono text-[10px] text-text-tertiary mb-2 uppercase tracking-wider">
                Decoded
              </p>
              {decoded.map((field, i) => (
                <AnimatePresence key={field.name}>
                  {i <= decodeIndex && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-start gap-3 rounded-lg px-3 py-2 ${
                        field.highlight
                          ? "bg-solution-bg border border-solution-cell"
                          : "bg-surface border border-border"
                      }`}
                    >
                      <span
                        className={`font-mono text-[11px] shrink-0 w-32 ${
                          field.highlight
                            ? "text-solution-accent font-medium"
                            : "text-text-tertiary"
                        }`}
                      >
                        {field.name}
                      </span>
                      <span
                        className={`font-mono text-[12px] ${
                          field.highlight
                            ? "text-solution-accent font-semibold"
                            : "text-text-primary"
                        }`}
                      >
                        {field.value}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <p className="font-mono text-xs text-problem-accent">{error}</p>
        )}

        {/* Call button */}
        <button
          onClick={runCall}
          disabled={step !== "idle" && step !== "done"}
          className={`w-full font-mono text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            step === "idle" || step === "done"
              ? "bg-solution-accent text-white hover:bg-solution-accent/90 cursor-pointer"
              : "bg-solution-accent/50 text-white/60 cursor-default"
          }`}
        >
          {step === "idle" && (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Call {symbol}/USD on Monad
            </>
          )}
          {step === "request" && "Sending eth_call to rpc.monad.xyz..."}
          {step === "response" && "Response received, decoding..."}
          {step === "decode" && "Decoding ABI..."}
          {step === "done" && (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Call again
            </>
          )}
        </button>
      </div>
    </div>
  );
}
