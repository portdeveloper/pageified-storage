# Analyzer Backend Plan

## Goal

User pastes a GitHub URL or Solidity source. Backend compiles it with
proper import resolution, returns the storage layout. Frontend displays
page groupings and gas savings.

## Architecture

```
Frontend (Vercel)              Backend (Fly.io or Vercel)

User pastes URL/source  →     POST /api/analyze
                               { source: string } or { githubUrl: string }

                               1. If GitHub URL: clone repo, find .sol files
                               2. Run forge build (or solc with remappings)
                               3. Extract storage layout via forge inspect
                               4. Return structured JSON

Display results         ←     {
                                 contracts: [{
                                   name, storageLayout, abi
                                 }]
                               }
```

## Option A: Vercel API Routes (try first)

### Pros
- No separate infra, same repo
- Free tier is generous
- Automatic deployments

### Cons
- Serverless functions have 250MB size limit (compressed)
- No persistent filesystem (need /tmp)
- 10s default timeout (60s on Pro, 300s on Enterprise)
- forge binary is ~50MB, foundry toolchain needs to be bundled or fetched

### Approach
- Use Next.js API route at `src/app/api/analyze/route.ts`
- Download a pre-built forge binary to /tmp on cold start
- Run forge in /tmp with the user's source
- Cache the forge binary across invocations (Vercel keeps /tmp warm)

### Feasibility concern
- forge needs to download solc versions, resolve dependencies
- /tmp has 512MB on Vercel, might be tight
- Cold start could be slow (downloading forge + solc)
- Might exceed timeout for large repos

### Verdict
Try it. If cold starts or size limits kill it, move to Fly.io.

## Option B: Fly.io (fallback)

### Pros
- Full VM, persistent filesystem
- Can install forge permanently
- No size limits, configurable timeout
- Free tier: 3 shared VMs

### Cons
- Separate infra to manage
- Need to deploy separately
- CORS setup needed

### Approach
- Simple Express/Hono server
- forge pre-installed in Dockerfile
- Single endpoint: POST /analyze
- Frontend calls it via fetch

## API Design

### POST /api/analyze

Request:
```json
{
  "source": "// SPDX-License-Identifier...",
  "githubUrl": "https://github.com/owner/repo/blob/main/src/Contract.sol"
}
```

One of `source` or `githubUrl` must be provided.

Response (success):
```json
{
  "success": true,
  "contracts": [
    {
      "name": "LendingPool",
      "storageLayout": [
        { "label": "owner", "slot": 0, "offset": 0, "type": "address", "numberOfBytes": 20 },
        { "label": "totalSupply", "slot": 1, "offset": 0, "type": "uint256", "numberOfBytes": 32 }
      ]
    }
  ]
}
```

Response (error):
```json
{
  "success": false,
  "errors": ["Compilation failed: ..."]
}
```

### For GitHub URLs

Full repo URL (`github.com/owner/repo`):
1. Shallow clone the repo
2. Run forge build
3. Extract storage layouts for all contracts
4. Return list of contracts with layouts

Direct file URL (`github.com/owner/repo/blob/branch/path/File.sol`):
1. Clone the repo (need full repo for imports)
2. Run forge build
3. Find the specified contract's layout
4. Return it

## Backend Implementation (Vercel approach)

### File: `src/app/api/analyze/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { source, githubUrl } = body;

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "analyzer-"));

  try {
    if (githubUrl) {
      // Clone and build
      const { owner, repo, branch, filePath } = parseGithubUrl(githubUrl);
      await execAsync(`git clone --depth 1 -b ${branch} https://github.com/${owner}/${repo}.git ${workDir}/repo`);
      await execAsync("forge build", { cwd: `${workDir}/repo` });
      // Extract layouts...
    } else if (source) {
      // Write source, init forge project, build
      await fs.mkdir(`${workDir}/src`, { recursive: true });
      await fs.writeFile(`${workDir}/src/Contract.sol`, source);
      await execAsync("forge init --no-git --no-commit .", { cwd: workDir });
      await execAsync("forge build", { cwd: workDir });
      // Extract layouts...
    }

    // Read forge output and extract storage layouts
    const layouts = await extractStorageLayouts(workDir);
    return NextResponse.json({ success: true, contracts: layouts });
  } catch (e) {
    return NextResponse.json({
      success: false,
      errors: [e.message]
    });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
```

### Problem: forge binary on Vercel

Vercel serverless functions run on Amazon Linux 2. We need a Linux
forge binary. Options:

1. Bundle it in the repo (too big, ~50MB)
2. Download on cold start to /tmp (adds 2-3s latency)
3. Use a Vercel build step to install it

Option 2 is simplest:

```typescript
async function ensureForge() {
  const forgePath = "/tmp/forge";
  try {
    await fs.access(forgePath);
    return forgePath; // Already downloaded
  } catch {
    // Download foundry
    await execAsync(
      "curl -L https://foundry.paradigm.xyz | bash && /root/.foundry/bin/foundryup",
      { env: { ...process.env, FOUNDRY_DIR: "/tmp/.foundry" } }
    );
    return "/tmp/.foundry/bin/forge";
  }
}
```

## Backend Implementation (Fly.io approach)

### Dockerfile

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y curl git
RUN curl -L https://foundry.paradigm.xyz | bash
RUN /root/.foundry/bin/foundryup

WORKDIR /app
COPY server.ts package.json tsconfig.json ./
RUN npm install
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### Server (Hono)

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use("/*", cors());

app.post("/analyze", async (c) => {
  const { source, githubUrl } = await c.req.json();
  // Same logic as Vercel route but with forge pre-installed
});

export default { port: 3001, fetch: app.fetch };
```

## Frontend Changes

Replace browser-side solc compilation with a fetch to the backend:

```typescript
// solc-utils.ts - replace compileSolidity()
export async function compileSolidity(
  source: string,
  githubUrl?: string
): Promise<CompilationResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(githubUrl ? { githubUrl } : { source }),
  });
  return res.json();
}
```

- Remove web-solc dependency
- Remove browser-side compilation
- Remove 8MB download
- Compilation becomes a simple API call

## Phased Approach

### Phase 1: Try Vercel API route
- Add `src/app/api/analyze/route.ts`
- Test locally with forge installed
- Deploy to Vercel, see if forge works in serverless
- If it works: done
- If not: Phase 2

### Phase 2: Fly.io backend
- Create separate Fly.io app
- Dockerfile with forge pre-installed
- Simple Hono server
- Update frontend to call Fly.io URL
- CORS configuration

### Phase 3: Enhancements
- Cache compiled results by content hash
- Support full repo URLs (clone + build)
- Multi-contract selector in frontend
- Function-level analysis via forge trace

## Security Considerations

- Sandbox forge execution (no network access during build)
- Timeout: 60s max per compilation
- Disk limit: clean up /tmp after each request
- Rate limit: prevent abuse (10 req/min per IP)
- Don't execute any contract code, only compile
- Validate GitHub URLs (only github.com)
- Sanitize source input (max 500KB)
