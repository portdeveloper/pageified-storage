import { NextRequest } from "next/server";

/**
 * Real MPP demo endpoint.
 *
 * Without an Authorization header → returns 402 with WWW-Authenticate: Payment
 * With a valid-looking credential  → returns 200 with Payment-Receipt header
 *
 * This mirrors the exact HTTP exchange that @monad-crypto/mpp produces.
 * Headers follow the MPP spec (RFC 7235 WWW-Authenticate scheme).
 */

const USDC = "0x754704Bc059F8C67012fEd69BC8A327a5aafb603";
const CHAIN_ID = "10143";
// Burn address as demo recipient — no real funds involved
const RECIPIENT = "0x000000000000000000000000000000000000dEaD";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");

  // If client sent a Payment credential, verify format and return 200
  if (auth && auth.startsWith("Payment ")) {
    return Response.json(
      {
        data: { block: 12345678, gasPrice: "52", tps: 10000 },
        _mpp: { paid: true, method: "monad", chain: CHAIN_ID },
      },
      {
        status: 200,
        headers: {
          "Payment-Receipt": `status="success", amount="100000", currency="${USDC}", settled=true`,
        },
      }
    );
  }

  // No credential — issue 402 challenge
  return Response.json(
    { error: "Payment Required", method: "monad" },
    {
      status: 402,
      headers: {
        "WWW-Authenticate": [
          `Payment method="monad"`,
          `amount="100000"`,
          `currency="${USDC}"`,
          `decimals="6"`,
          `recipient="${RECIPIENT}"`,
          `chainId="${CHAIN_ID}"`,
          `description="Monad network stats"`,
        ].join(", "),
      },
    }
  );
}
