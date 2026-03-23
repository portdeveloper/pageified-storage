# MIP-8: Page-ified Storage — Interactive Explainer

## TL;DR for Variant

A scroll-driven, single-page interactive explainer for MIP-8 (a blockchain storage proposal). The page tells a story in two halves: first the problem — the EVM reads 32-byte storage slots individually, but hardware always fetches 4KB pages (128 slots), wasting 128x bandwidth; Keccak hashing scatters logically adjacent struct fields across different disk pages, so 4 related reads = 4 cold reads = 8400 gas — visualized as an interactive grid where users click SLOAD and watch slots light up on scattered pages. Then the solution — MIP-8 groups 128 consecutive slots into a page so touching one slot warms all 128; same 4 reads now cost 1 cold + 3 warm = 2400 gas — visualized as one page grid that warms entirely on first click. The recurring visual motif is an 8x16 grid (128 cells = one page) shown in different states: cold (neutral), warm (teal wash), and highlighted (active slot). Additional sections include an animated slot-to-page mapping visualizer, a BLAKE3 Merkle tree where clicking a slot highlights its proof path, a side-by-side gas calculator with scenario picker, and developer takeaway cards. No Monad branding — neutral, brand-agnostic design with warm tones for "problem" sections transitioning to cool tones for "solution" sections, like Stripe docs energy. Fully interactive (click slots, toggle scenarios, drag sliders), not just animated illustrations.

---

## What this is
A single-page interactive explainer for MIP-8 (Monad's page-ified storage proposal). Target audience: developers who understand EVM basics but haven't read the MIP. Goal: make them *feel* the inefficiency of current storage, then *see* how page-ified storage fixes it.

## Brand context
- NO Monad branding — this is independent educational content, not official
- Neutral, clean, technical aesthetic — think Stripe docs or Dan Abramov's blog
- Tone: confident, precise, not hype-y
- Color palette should be brand-agnostic (no Monad purple). Suggest neutral base with functional color coding: warm tones for "problem/waste", cool tones for "solution/efficiency"

---

## Page structure (scroll-driven, section by section)

### Section 1 — Hero
**"What if your storage model matched your hardware?"**

Subtext: MIP-8 aligns EVM storage with how disks actually work — 4KB pages, not 32-byte slots.

A subtle animation: a single 32-byte slot being read, but a full 4KB page lighting up around it to show what the disk *actually* fetches. The wasted bandwidth fades out.

---

### Section 2 — The Problem: "Hashing destroys locality"
**Interactive visualization: Scattered Slots**

Show a contract with a struct containing 4 fields (slots 0, 1, 2, 3). On Ethereum's MPT, Keccak hashing scatters these across random disk pages.

- **Visual:** A grid of ~8 pages (each an 8x16 grid of 128 cells). Four slots are highlighted in orange/red, each on a *different* page. Lines connect them back to the original struct definition on the left.
- **Interaction:** User clicks "SLOAD slot 0" → Page A lights up, a cold read counter increments (2100 gas). Click "SLOAD slot 1" → Page B lights up, another cold read (2100 gas). Repeat for slots 2, 3. Total: 4 cold reads, 4 pages loaded, 8400 gas.
- **Callout stat:** "128x bandwidth wasted per read — you asked for 32 bytes, the disk fetched 4096"

---

### Section 3 — The Fix: "One page touch warms 128 slots"
**Interactive visualization: Contiguous Page**

Same struct, but now on MIP-8. All 4 slots land on the same page (Page 0).

- **Visual:** One page grid (8x16 = 128 cells). Slots 0-3 highlighted at the top. The entire page has a subtle warm tint with a dashed border.
- **Interaction:** User clicks "SLOAD slot 0" → the entire page warms up (green/teal wash). Cold read: 2100 gas. Click "SLOAD slot 1" → already warm, 100 gas. Slots 2, 3 → 100 gas each. Total: 2400 gas.
- **Comparison bar** appears at the bottom: "Current EVM: 8400 gas → MIP-8: 2400 gas" with a percentage savings indicator.

---

### Section 4 — How Pages Work (technical but visual)
**Animated diagram: Slot → Page mapping**

Show the math visually:
- `page_index(slot) = slot >> 7` — a slot number slides right by 7 bits, landing in a page bucket
- `offset(slot) = slot & 0x7F` — the remainder becomes the position within the page

Visual: a number line of slots (0–255+) with bracket markers showing Page 0 (slots 0–127), Page 1 (slots 128–255), etc. User can drag a slot number and watch it snap into its page.

---

### Section 5 — BLAKE3 Page Commitments
**Animated Merkle tree**

Show how a 4096-byte page is committed:
1. 128 slots pair up into 64 leaf nodes
2. BLAKE3 compression builds a binary tree (6 levels)
3. Final 32-byte root = the page commitment

- **Interaction:** User clicks a single slot → the inclusion proof path highlights (the slot, its sibling, and 6 parent hashes up to the root). A sidebar shows proof size: ~256 bytes.
- **Callout:** "Single-word proofs with zero overhead — empty slots are just zero"

---

### Section 6 — Gas Model Comparison
**Side-by-side interactive calculator**

Two columns: "Current EVM" vs "MIP-8"

User picks a scenario from a dropdown or builds their own:
- "Read 4 struct fields" → shows gas breakdown
- "Write to 3 slots in same page" → shows I/O cost + state growth cost
- "First write to a new page" → shows PAGE_WRITE_COST
- "Access a mapping (random key)" → shows that mappings still work fine (different pages, cold reads — no worse than today)

Each scenario animates the page grids and accumulates gas in a running counter.

---

### Section 7 — What This Means for Developers
**Three cards with icons:**

1. **Structs get cheaper** — Solidity packs struct fields into consecutive slots. Under MIP-8, accessing your whole struct often costs 1 cold read + N warm reads instead of N cold reads.

2. **Mappings stay the same** — Mapping keys hash to random pages (by design). MIP-8 doesn't make this worse — it just stops pretending sequential storage is random.

3. **New optimization patterns** — Page-aware arrays, assembly-level tricks for packing related data into the same 128-slot page. A new design space for gas optimization.

---

### Section 8 — Backwards Compatibility
Short text section, no heavy visuals needed.

"EVM semantics are unchanged. Only gas costs change. Most contracts get cheaper automatically because Solidity already packs state variables contiguously. The only contracts affected negatively are those hardcoding specific gas values for opcodes."

---

### Section 9 — Footer / CTA
Links to:
- Full MIP-8 text (GitHub)
- Forum discussion (forum.monad.xyz)
- MIP-9 teaser: "Next up: optimizing proof sizes with flexible fanout trees"
- Monad socials

---

## Key design principles

1. **Scroll-driven reveals** — each section appears as you scroll, with animations triggered on entry. Not a click-through slideshow.
2. **The grid is the hero visual** — the 8x16 grid of 128 cells representing a page should be the recurring motif. It appears in sections 2, 3, 5, and 6 in different states (cold/warm/highlighted).
3. **Interactive, not just animated** — users should click slots, toggle scenarios, drag sliders. This isn't a blog post with gifs.
4. **Two-tone storytelling** — the "problem" sections use warm/red tones (wasted, scattered), the "solution" sections use cool/teal tones (efficient, grouped). The transition between sections 2→3 should feel like a visual relief.
5. **Numbers that hit** — "128x bandwidth waste", "71% gas savings", "256-byte proofs". These should be large, animated counters.
6. **Mobile-friendly** — grids can shrink to 4x32 or show a subset of slots. Interactions can be tap-based.

## Tech suggestions
- Next.js or plain React + Tailwind
- Framer Motion for scroll-triggered animations
- Canvas or SVG for the Merkle tree visualization
- No blockchain connectivity needed — this is purely educational, all values are illustrative

## Reference
- MIP-8 spec: https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-8.md
- Forum discussion: https://forum.monad.xyz/t/mip-8-page-ified-storage-state/407
