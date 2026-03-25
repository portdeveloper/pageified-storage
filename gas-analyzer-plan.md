# MIP-8 Gas Analyzer - Implementation Plan

## What it does

User pastes a GitHub URL (or raw Solidity source). The tool compiles it,
shows the storage layout with page boundaries, and calculates MIP-8 gas
savings for selected functions.

## Architecture

### MVP (browser-only, no backend)

1. User inputs: GitHub URL or raw Solidity paste
2. Fetch source files via GitHub API (public repos only)
3. Compile with solc-js (runs in browser, ~2MB wasm)
4. Extract storage layout from compiler output (`--storage-layout`)
5. Display: variables grouped into 128-slot pages
6. User selects which variables a function touches (checkboxes)
7. Auto-calculate: current gas vs MIP-8 gas based on page groupings

### What solc-js gives us

```json
{
  "storage": [
    { "label": "owner", "slot": "0", "type": "t_address" },
    { "label": "balances", "slot": "1", "type": "t_mapping(...)" },
    { "label": "totalSupply", "slot": "2", "type": "t_uint256" }
  ]
}
```

This tells us: variable name, slot number, type. We can group by page
(slot >> 7) and show which variables share a page.

### What solc-js does NOT give us

- Which functions access which slots (need AST walk or bytecode trace)
- Runtime behavior (conditional branches, loops)
- Proxy/delegatecall patterns
- Mapping key-dependent slot locations

### MVP scope (what we build)

- Solidity source input (paste or GitHub fetch)
- solc-js compilation with storage layout output
- Visual page map: slots 0-127 = page 0, 128-255 = page 1, etc.
- Each variable shown in its page with slot number
- Checkbox per variable: "accessed in this function?"
- Gas calculation: checked variables → unique pages → savings

### NOT in MVP

- Automatic function-to-variable mapping
- Bytecode trace / simulation
- Multi-file project compilation (need remappings, imports)
- Proxy contract analysis
- Mapping value slot calculation

## Technical details

### solc-js setup

```
npm install solc
```

Browser-compatible. Accepts Solidity source, returns compiled output
including storage layout when requested via:

```json
{
  "language": "Solidity",
  "sources": { "Contract.sol": { "content": "..." } },
  "settings": {
    "outputSelection": {
      "*": { "*": ["storageLayout"] }
    }
  }
}
```

### GitHub URL parsing

Input: `https://github.com/aave/aave-v4`
or: `https://github.com/aave/aave-v4/blob/main/src/core/Pool.sol`

For a full repo URL:
- Use GitHub API to list Solidity files
- Let user pick which contract to analyze
- Fetch raw content via API

For a direct file URL:
- Parse owner/repo/path from URL
- Fetch raw content directly

### Import resolution

This is the hardest part for real projects. Options:
1. Simple: only support single-file contracts (paste or single .sol)
2. Medium: resolve relative imports within same repo via GitHub API
3. Full: resolve node_modules imports (OpenZeppelin etc.) - needs a
   virtual filesystem or pre-bundled common libraries

MVP: start with single-file. Add "flatten your contract first" guidance.
Tools like `forge flatten` or Etherscan's flattened source work here.

### Page grouping algorithm

```typescript
interface StorageVar {
  label: string;
  slot: number;
  type: string;
  page: number; // slot >> 7
}

function groupByPage(vars: StorageVar[]): Map<number, StorageVar[]> {
  const pages = new Map();
  for (const v of vars) {
    const page = v.slot >> 7;
    if (!pages.has(page)) pages.set(page, []);
    pages.get(page).push(v);
  }
  return pages;
}
```

### Gas calculation

```typescript
function calculateGas(selectedVars: StorageVar[]) {
  const COLD = 8100;
  const WARM = 100;

  // Current: each unique slot = one cold read
  const uniqueSlots = new Set(selectedVars.map(v => v.slot));
  const currentGas = uniqueSlots.size * COLD;

  // MIP-8: each unique page = one cold, rest warm
  const uniquePages = new Set(selectedVars.map(v => v.page));
  const mip8Gas = uniquePages.size * COLD +
    (uniqueSlots.size - uniquePages.size) * WARM;

  return { currentGas, mip8Gas, savings: 1 - mip8Gas / currentGas };
}
```

### Mapping/array handling

Mappings and dynamic arrays use hashed base slots:
- `mapping(k => v)` at slot S: value at `keccak256(k . S)`
- `T[] arr` at slot S: length at S, elements at `keccak256(S) + i`

For mappings: each key hashes to a different location, likely different
pages. Display as "scattered (no page benefit)" with a note.

For dynamic arrays: elements ARE contiguous from `keccak256(S)`. If
accessing N consecutive elements, they benefit from page grouping.
Display the base slot and note that elements are contiguous.

For structs inside mappings: fields are contiguous from the hashed base.
`mapping(address => UserData)` where UserData has 5 fields = 5
contiguous slots from a hashed base. These benefit from page grouping
within the same key lookup.

## UI layout

New route: `/analyzer` (or section within `/mip-8`)

### Input panel (top)
- Tab: "Paste Solidity" | "GitHub URL"
- Paste: textarea with syntax highlighting
- GitHub: URL input + file picker dropdown
- "Compile" button
- Error display for compilation failures

### Storage layout panel (middle)
- Visual page map: colored blocks for each page
- Variables listed within their page, showing slot number and type
- Mappings/arrays shown with special "scattered" or "contiguous from hash" labels
- Checkboxes next to each variable

### Function selector (optional enhancement)
- List functions from the ABI
- Clicking a function pre-checks the variables it likely accesses
- This is a heuristic: parse function body for state variable references

### Results panel (bottom)
- Current gas: N × 8,100
- MIP-8 gas: P × 8,100 + (N - P) × 100
- Savings percentage and ratio
- Visual bar comparison (reuse existing pattern)

## File structure

```
src/
  app/analyzer/page.tsx          - route page
  components/analyzer/
    AnalyzerInput.tsx             - source input (paste/github)
    StorageLayoutView.tsx         - page map + variable checkboxes
    GasResultsView.tsx            - savings calculation display
    solc-worker.ts                - web worker for solc compilation
    github.ts                     - GitHub API fetch utilities
    storage-layout.ts             - parse + group storage layout
```

## Dependencies

- `solc` (solc-js) - Solidity compiler, browser-compatible
- Existing: framer-motion, tailwind, next.js

## Risks

1. solc-js is ~8MB download, will slow initial page load.
   Mitigation: lazy-load via dynamic import, show loading state.

2. Multi-file contracts won't compile without imports.
   Mitigation: guide users to paste flattened source. Add
   "forge flatten" instructions.

3. Storage layout may not be available for all solc versions.
   Mitigation: default to 0.8.x which supports it.

4. Large contracts may be slow to compile in browser.
   Mitigation: run solc in a web worker to avoid blocking UI.

## Phased delivery

### Phase 1: Paste + compile + show layout
- Textarea input
- solc-js compilation in web worker
- Storage layout display with page groupings
- Manual variable selection + gas calculation

### Phase 2: GitHub integration
- URL input + file fetching
- Single-file contracts from repos
- Contract/file picker for repos with multiple .sol files

### Phase 3: Smart function analysis
- Parse AST to identify which functions reference which state variables
- Pre-check variables when user selects a function
- Still user-editable (can add/remove checks)

### Phase 4: Import resolution
- Resolve relative imports within same repo
- Bundle common libraries (OpenZeppelin)
- Support multi-file compilation
