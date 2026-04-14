"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

type Mode = "push" | "pull";
type FlowStep =
  | "idle"
  | "request"
  | "challenge"
  | "payment"
  | "retry"
  | "success";

interface ChallengeField {
  name: string;
  value: string;
  highlight?: boolean;
}

interface ReceiptField {
  name: string;
  value: string;
  highlight?: boolean;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const STEP_ORDER: FlowStep[] = [
  "idle",
  "request",
  "challenge",
  "payment",
  "retry",
  "success",
];

const USDC_ADDRESS = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function shortenAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

/** Parse WWW-Authenticate: Payment header into key-value pairs */
function parseChallenge(header: string): ChallengeField[] {
  const fields: ChallengeField[] = [];
  const re = /(\w+)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(header)) !== null) {
    const name = m[1];
    let value = m[2];
    if (value.startsWith("0x") && value.length > 20) {
      value = shortenAddr(value);
    }
    fields.push({
      name,
      value: '"' + value + '"',
      highlight: name === "amount",
    });
  }
  return fields;
}

/** Parse Payment-Receipt header into key-value pairs */
function parseReceipt(header: string): ReceiptField[] {
  const fields: ReceiptField[] = [];
  const re = /(\w+)="?([^",]*)"?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(header)) !== null) {
    const name = m[1];
    let value = m[2];
    if (value.startsWith("0x") && value.length > 20) {
      value = shortenAddr(value);
    }
    fields.push({
      name,
      value: value === "true" || value === "false" ? value : '"' + value + '"',
      highlight: name === "status",
    });
  }
  return fields;
}

/* ─── Code snippets ──────────────────────────────────────────────────── */

function getServerSnippet(): string {
  return "// npm install @monad-crypto/mpp mppx viem hono\n" +
    "import { Mppx } from \"mppx/hono\";\n" +
    "import { monad } from \"@monad-crypto/mpp/server\";\n" +
    "import { privateKeyToAccount } from \"viem/accounts\";\n" +
    "import { createPublicClient, http } from \"viem\";\n" +
    "import { Hono } from \"hono\";\n" +
    "\n" +
    "const account = privateKeyToAccount(process.env.SERVER_KEY);\n" +
    "\n" +
    "const mppx = Mppx.create({\n" +
    "  methods: [\n" +
    "    monad({\n" +
    "      account,\n" +
    "      recipient: account.address,\n" +
    "      amount: \"0.10\",             // 0.10 USDC per request\n" +
    "      currency: \"" + USDC_ADDRESS + "\",\n" +
    "      decimals: 6,\n" +
    "      description: \"Monad network stats\",\n" +
    "      externalId: \"stats-v1\",\n" +
    "      getClient: () => createPublicClient({\n" +
    "        transport: http(\"https://rpc.monad.xyz\"),\n" +
    "      }),\n" +
    "      store: new Map(),           // replay protection (use Redis in prod)\n" +
    "    }),\n" +
    "  ],\n" +
    "});\n" +
    "\n" +
    "const app = new Hono();\n" +
    "\n" +
    "// Protect any route with mppx.charge({})\n" +
    "app.get(\"/api/stats\", mppx.charge({}), (c) => {\n" +
    "  // Runs only after payment is verified on Monad (chain 10143)\n" +
    "  return c.json({ block: 12345678, gasPrice: \"52\", tps: 10000 });\n" +
    "});\n" +
    "\n" +
    "export default app;";
}

function getClientSnippet(mode: Mode): string {
  const modeDesc = mode === "push"
    ? "client pays gas, sends ERC-20 transfer"
    : "client signs off-chain, server pays gas";
  const step3 = mode === "push"
    ? "broadcasts USDC.transfer() on Monad"
    : "signs ERC-3009 transferWithAuthorization";
  const step4cred = mode === "push" ? "tx hash" : "signed auth";
  const step5 = mode === "push"
    ? "verifies transfer on-chain"
    : "broadcasts transfer + verifies";

  return "// npm install @monad-crypto/mpp mppx viem\n" +
    "import { Mppx } from \"mppx/client\";\n" +
    "import { monad } from \"@monad-crypto/mpp/client\";\n" +
    "import { privateKeyToAccount } from \"viem/accounts\";\n" +
    "\n" +
    "const account = privateKeyToAccount(process.env.CLIENT_KEY);\n" +
    "\n" +
    "// Set up MPP — patches fetch to handle 402 responses\n" +
    "Mppx.create({\n" +
    "  methods: [\n" +
    "    monad({\n" +
    "      account,\n" +
    "      mode: \"" + mode + "\",  // " + modeDesc + "\n" +
    "    }),\n" +
    "  ],\n" +
    "});\n" +
    "\n" +
    "// Now just use fetch — MPP handles payment automatically\n" +
    "const res = await fetch(\"https://stats-api.example.com/api/stats\");\n" +
    "const data = await res.json();\n" +
    "console.log(data); // { block: 12345678, gasPrice: \"52\", tps: 10000 }\n" +
    "\n" +
    "// Under the hood:\n" +
    "// 1. fetch() sends GET /api/stats\n" +
    "// 2. Server responds 402 + payment challenge\n" +
    "// 3. Client " + step3 + "\n" +
    "// 4. Client retries with " + step4cred + " as credential\n" +
    "// 5. Server " + step5 + ", returns 200 OK";
}

function getAIPrompt(mode: Mode): string {
  const modeDesc = mode === "push"
    ? "broadcasts ERC-20 transfer, credential = tx hash"
    : "signs ERC-3009 transferWithAuthorization, credential = signed auth";

  return "I want to add per-request machine payments to my API using MPP on Monad.\n" +
    "\n" +
    "## What MPP is\n" +
    "MPP (Machine Payments Protocol) is an open standard for machine-to-machine\n" +
    "payments via HTTP 402. APIs charge per-request using USDC on Monad.\n" +
    "\n" +
    "## The flow\n" +
    "1. Client sends GET /resource\n" +
    "2. Server returns 402 Payment Required with WWW-Authenticate: Payment header\n" +
    "3. Client pays (" + mode + " mode) — " + modeDesc + "\n" +
    "4. Client retries with Authorization: Payment <credential>\n" +
    "5. Server verifies, returns 200 OK with Payment-Receipt header\n" +
    "\n" +
    "## Server setup\n" +
    getServerSnippet() + "\n" +
    "\n" +
    "## Client setup\n" +
    getClientSnippet(mode) + "\n" +
    "\n" +
    "## Key details\n" +
    "- npm install mppx @monad-crypto/mpp viem\n" +
    "- Monad mainnet chain ID: 10143\n" +
    "- Default token: USDC (6 decimals) at " + USDC_ADDRESS + "\n" +
    "- Push mode: client pays gas, broadcasts ERC-20 transfer\n" +
    "- Pull mode: server pays gas, client signs ERC-3009 authorization off-chain\n" +
    "- Server: import { Mppx } from \"mppx/hono\", import { monad } from \"@monad-crypto/mpp/server\"\n" +
    "- Client: import { Mppx } from \"mppx/client\", import { monad } from \"@monad-crypto/mpp/client\"\n" +
    "- Client library patches fetch — after setup, just use fetch() normally\n" +
    "- Server uses mppx.charge({}) as Hono middleware\n" +
    "- MPP spec: https://mpp.dev\n" +
    "- Monad docs: https://docs.monad.xyz/reference/mpp/overview\n" +
    "- Package: https://www.npmjs.com/package/@monad-crypto/mpp\n" +
    "\n" +
    "Integrate this into my project following my existing code patterns.";
}

/* ─── Main component ─────────────────────────────────────────────────── */

export default function PaymentsPlayground() {
  const [mode, setMode] = useState<Mode>("push");
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [revealIndex, setRevealIndex] = useState(-1);
  const [copied, setCopied] = useState<string | null>(null);
  const [codeTab, setCodeTab] = useState<"server" | "client">("server");
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);
  const [challengeFields, setChallengeFields] = useState<ChallengeField[]>([]);
  const [receiptFields, setReceiptFields] = useState<ReceiptField[]>([]);
  const [responseBody, setResponseBody] = useState<string>("");
  const [challengeStatus, setChallengeStatus] = useState("");
  const genRef = useRef(0);

  const isAtOrPast = (step: FlowStep) =>
    STEP_ORDER.indexOf(flowStep) >= STEP_ORDER.indexOf(step);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleModeChange = (m: Mode) => {
    genRef.current++;
    setMode(m);
    setFlowStep("idle");
    setRevealIndex(-1);
    setChallengeFields([]);
    setReceiptFields([]);
    setResponseBody("");
    setError(null);
    setLatencyMs(0);
  };

  const runFlow = useCallback(async () => {
    const gen = ++genRef.current;
    setRevealIndex(-1);
    setError(null);
    setChallengeFields([]);
    setReceiptFields([]);
    setResponseBody("");
    setLatencyMs(0);

    try {
      // Step 1: Real fetch → expect 402
      setFlowStep("request");
      const t0 = performance.now();

      const challengeRes = await fetch("/api/mpp-demo");

      if (genRef.current !== gen) return;
      setChallengeStatus(String(challengeRes.status));

      if (challengeRes.status !== 402) {
        throw new Error("Expected 402, got " + challengeRes.status);
      }

      // Step 2: Parse real WWW-Authenticate header
      setFlowStep("challenge");
      const wwwAuth = challengeRes.headers.get("www-authenticate") || "";
      const parsed = parseChallenge(wwwAuth);
      setChallengeFields(parsed);
      setRevealIndex(-1);

      for (let i = 0; i < parsed.length; i++) {
        await delay(350);
        if (genRef.current !== gen) return;
        setRevealIndex(i);
      }
      await delay(500);
      if (genRef.current !== gen) return;

      // Step 3: Payment step (educational — no wallet connected)
      setFlowStep("payment");
      setRevealIndex(-1);
      await delay(1500);
      if (genRef.current !== gen) return;

      // Step 4: Real fetch with Authorization header → expect 200
      setFlowStep("retry");
      setRevealIndex(-1);

      const retryRes = await fetch("/api/mpp-demo", {
        headers: { Authorization: "Payment credential=\"demo\"" },
      });

      if (genRef.current !== gen) return;

      if (retryRes.status !== 200) {
        throw new Error("Expected 200, got " + retryRes.status);
      }

      await delay(500);
      if (genRef.current !== gen) return;

      // Step 5: Parse real response
      setFlowStep("success");
      const t2 = performance.now();
      setLatencyMs(Math.round(t2 - t0));

      const receipt = retryRes.headers.get("payment-receipt") || "";
      const parsedReceipt = parseReceipt(receipt);
      setReceiptFields(parsedReceipt);

      const body = await retryRes.json();
      setResponseBody(JSON.stringify(body.data, null, 2));

      setRevealIndex(-1);
      for (let i = 0; i < parsedReceipt.length; i++) {
        await delay(350);
        if (genRef.current !== gen) return;
        setRevealIndex(i);
      }
      await delay(400);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Flow failed");
      setFlowStep("idle");
    }
  }, []);

  const showChallengeField = (i: number) => {
    if (flowStep === "challenge") return revealIndex >= i;
    return STEP_ORDER.indexOf(flowStep) > STEP_ORDER.indexOf("challenge");
  };

  const showReceiptField = (i: number) => {
    if (flowStep === "success") return revealIndex >= i;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Install command */}
      <div>
        <p className="font-mono text-[11px] text-text-tertiary mb-3">
          Install
        </p>
        <div className="flex items-center gap-2 bg-surface-elevated rounded-lg px-3 py-2 border border-border">
          <code className="font-mono text-[13px] text-text-primary flex-1">
            npm install @monad-crypto/mpp mppx viem
          </code>
          <button
            onClick={() =>
              copyToClipboard(
                "npm install @monad-crypto/mpp mppx viem",
                "install"
              )
            }
            className="font-mono text-[10px] text-text-tertiary hover:text-text-primary transition-colors shrink-0"
          >
            {copied === "install" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Live flow ────────────────────────────────────────── */}
        <div className="bg-surface-elevated rounded-2xl border border-border p-6 space-y-4">
          {/* Mode toggle */}
          <div>
            <p className="font-mono text-[11px] text-text-tertiary mb-2">
              Payment mode
            </p>
            <div className="flex gap-2">
              {(["push", "pull"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    mode === m
                      ? "bg-text-primary text-surface border-text-primary"
                      : "bg-surface text-text-secondary border-border hover:border-text-tertiary hover:text-text-primary"
                  }`}
                >
                  {m === "push"
                    ? "Push \u2014 client pays gas"
                    : "Pull \u2014 server pays gas"}
                </button>
              ))}
            </div>
          </div>

          {/* Flow header */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                flowStep === "idle"
                  ? "bg-text-tertiary/30"
                  : flowStep === "success"
                    ? "bg-solution-accent"
                    : "bg-problem-accent animate-pulse"
              }`}
            />
            <p className="font-mono text-[11px] text-text-secondary">
              Live HTTP 402 flow
            </p>
            <span className="font-mono text-[10px] text-text-tertiary ml-auto">
              /api/mpp-demo
            </span>
            {flowStep === "success" && latencyMs > 0 && (
              <span className="font-mono text-[10px] text-solution-accent">
                {latencyMs}ms
              </span>
            )}
          </div>

          {/* Flow visualization */}
          <div className="bg-surface rounded-lg border border-border p-3 space-y-0 min-h-[200px]">
            {/* Step 1: Request (always visible) */}
            <div
              className={`font-mono text-[13px] leading-relaxed transition-colors duration-300 ${
                isAtOrPast("request")
                  ? "text-text-primary"
                  : "text-text-tertiary/50"
              }`}
            >
              <span className="text-text-tertiary">&rarr;</span>{" "}
              <span
                className={
                  isAtOrPast("request")
                    ? "text-solution-accent font-medium"
                    : ""
                }
              >
                GET
              </span>{" "}
              /api/mpp-demo
              <div className="text-text-tertiary text-[12px] mt-0.5 ml-3">
                Host: {typeof window !== "undefined" ? window.location.host : "localhost"}
              </div>
            </div>

            {/* Step 2: Challenge — real 402 response */}
            <AnimatePresence>
              {isAtOrPast("challenge") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[13px] leading-relaxed"
                >
                  <div className="border-t border-border/50 mt-3 pt-3">
                    <span className="text-text-tertiary">&larr;</span>{" "}
                    <span className="text-problem-accent font-medium">
                      {challengeStatus}
                    </span>{" "}
                    Payment Required
                    <div className="text-text-secondary text-[12px] mt-1 ml-3">
                      WWW-Authenticate: Payment
                    </div>
                    <div className="ml-6 mt-1 space-y-0.5">
                      {challengeFields.map((field, i) => (
                        <AnimatePresence key={field.name}>
                          {showChallengeField(i) && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25 }}
                              className={`text-[12px] ${
                                field.highlight
                                  ? "text-solution-accent font-medium"
                                  : "text-text-tertiary"
                              }`}
                            >
                              {field.name}={field.value}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Payment (educational — no wallet connected) */}
            <AnimatePresence>
              {isAtOrPast("payment") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[13px] leading-relaxed"
                >
                  <div className="border-t border-border/50 mt-3 pt-3">
                    <span className="text-solution-accent">&#9889;</span>{" "}
                    <span className="text-text-primary">
                      {mode === "push"
                        ? "Client broadcasts USDC transfer on Monad..."
                        : "Client signs ERC-3009 authorization..."}
                    </span>
                    <div className="text-text-tertiary text-[12px] mt-1 ml-5">
                      {mode === "push"
                        ? "USDC(" + shortenAddr(USDC_ADDRESS) + ").transfer(recipient, amount)"
                        : "USDC(" + shortenAddr(USDC_ADDRESS) + ").transferWithAuthorization(...)"}
                    </div>
                    <AnimatePresence>
                      {isAtOrPast("retry") && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          className="text-solution-accent text-[12px] mt-1 ml-5"
                        >
                          {mode === "push"
                            ? "\u2713 tx confirmed on Monad (chain 10143)"
                            : "\u2713 Signed off-chain (server broadcasts)"}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 4: Retry — real fetch with Authorization header */}
            <AnimatePresence>
              {isAtOrPast("retry") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[13px] leading-relaxed"
                >
                  <div className="border-t border-border/50 mt-3 pt-3">
                    <span className="text-text-tertiary">&rarr;</span>{" "}
                    <span className="text-solution-accent font-medium">
                      GET
                    </span>{" "}
                    /api/mpp-demo
                    <div className="text-solution-accent text-[12px] mt-0.5 ml-3">
                      Authorization: Payment credential=&quot;
                      {mode === "push" ? "0xtxHash..." : "base64(signedAuth)"}
                      &quot;
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 5: Success — real 200 response */}
            <AnimatePresence>
              {isAtOrPast("success") && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[13px] leading-relaxed"
                >
                  <div className="border-t border-border/50 mt-3 pt-3">
                    <span className="text-text-tertiary">&larr;</span>{" "}
                    <span className="text-solution-accent font-medium">
                      200
                    </span>{" "}
                    OK
                    <div className="text-text-secondary text-[12px] mt-1 ml-3">
                      Payment-Receipt:
                    </div>
                    <div className="ml-6 mt-1 space-y-0.5">
                      {receiptFields.map((field, i) => (
                        <AnimatePresence key={field.name}>
                          {showReceiptField(i) && (
                            <motion.div
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25 }}
                              className={`text-[12px] ${
                                field.highlight
                                  ? "text-solution-accent font-medium"
                                  : "text-text-tertiary"
                              }`}
                            >
                              {field.name}={field.value}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ))}
                    </div>
                    {responseBody && (
                      <AnimatePresence>
                        {flowStep === "success" &&
                          revealIndex >= receiptFields.length - 1 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="text-text-tertiary text-[12px] mt-2 ml-3 whitespace-pre"
                            >
                              {responseBody}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Run button */}
          <button
            onClick={runFlow}
            disabled={flowStep !== "idle" && flowStep !== "success"}
            className={`w-full font-mono text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              flowStep === "idle" || flowStep === "success"
                ? "bg-solution-accent text-white hover:bg-solution-accent/90"
                : "bg-solution-accent/50 text-white/60 cursor-default"
            }`}
          >
            {flowStep === "idle" && "Run MPP flow"}
            {flowStep === "request" && "GET /api/mpp-demo ..."}
            {flowStep === "challenge" && "402 Payment Required..."}
            {flowStep === "payment" &&
              (mode === "push"
                ? "Broadcasting transfer..."
                : "Signing authorization...")}
            {flowStep === "retry" && "Retrying with credential..."}
            {flowStep === "success" && (
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
                Run again
              </>
            )}
          </button>

          {error && (
            <p className="font-mono text-xs text-problem-accent">{error}</p>
          )}

          {/* Info box */}
          <div className="bg-solution-bg/50 rounded-xl p-4 border border-solution-cell">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-mono text-[11px] text-solution-accent font-medium">
                Machine Payments Protocol
              </p>
              <span className="font-mono text-[10px] text-solution-muted bg-solution-cell px-1.5 py-0.5 rounded">
                HTTP 402
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              MPP lets agents and apps pay for API calls automatically. Server
              returns{" "}
              <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">
                402
              </code>
              , client pays in USDC on Monad, retries with proof.{" "}
              <strong>Push</strong>: client broadcasts transfer.{" "}
              <strong>Pull</strong>: client signs, server broadcasts.{" "}
              <a
                href="https://docs.monad.xyz/reference/mpp/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-primary"
              >
                Docs
              </a>
              {" \u00B7 "}
              <a
                href="https://mpp.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-primary"
              >
                mpp.dev
              </a>
              {" \u00B7 "}
              <a
                href="https://github.com/monad-crypto/monad-ts"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-text-primary"
              >
                GitHub
              </a>
            </p>
          </div>

          {/* USDC contract address */}
          <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2 border border-border">
            <span className="font-mono text-[11px] text-text-tertiary shrink-0">
              USDC
            </span>
            <code className="font-mono text-[11px] text-text-primary truncate flex-1">
              {USDC_ADDRESS}
            </code>
            <button
              onClick={() => copyToClipboard(USDC_ADDRESS, "usdc")}
              className="font-mono text-[10px] text-text-tertiary hover:text-text-primary transition-colors shrink-0"
            >
              {copied === "usdc" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* ── Right: Code panel ────────────────────────────────────────── */}
        <div className="bg-surface-elevated rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="flex items-center border-b border-border px-4">
            <button
              onClick={() => setCodeTab("server")}
              className={`font-mono text-xs px-3 py-3 border-b-2 transition-all ${
                codeTab === "server"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Server
            </button>
            <button
              onClick={() => setCodeTab("client")}
              className={`font-mono text-xs px-3 py-3 border-b-2 transition-all ${
                codeTab === "client"
                  ? "border-text-primary text-text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Client
            </button>
            <div className="flex-1" />
            <button
              onClick={() =>
                copyToClipboard(
                  codeTab === "server"
                    ? getServerSnippet()
                    : getClientSnippet(mode),
                  "code"
                )
              }
              className="font-mono text-[11px] text-text-tertiary hover:text-text-primary transition-colors px-2 py-1"
            >
              {copied === "code" ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5">
            <AnimatePresence mode="wait">
              <motion.pre
                key={mode + "-" + codeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-[13px] leading-relaxed text-text-primary whitespace-pre-wrap break-words"
              >
                {codeTab === "server"
                  ? getServerSnippet()
                  : getClientSnippet(mode)}
              </motion.pre>
            </AnimatePresence>
          </div>

          <div className="border-t border-border p-4">
            <button
              onClick={() => copyToClipboard(getAIPrompt(mode), "ai")}
              className="w-full font-mono text-sm px-4 py-3 rounded-xl bg-text-primary text-surface hover:bg-text-primary/90 transition-all flex items-center justify-center gap-2"
            >
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied === "ai"
                ? "Copied! Paste into your AI assistant"
                : "Copy for AI \u2014 MPP server + client setup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
