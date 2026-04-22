# Handoff: BTX Batched Threshold Encryption — Paper Landing Page

## Overview

A single-page explainer for **BTX (Batched Threshold Encryption)**, the Category Labs research paper on encrypted-mempool cryptography. The design translates the paper's core contributions — collision-free, epochless, compact, fast BTE — into a scroll-through narrative with interactive visualizations so a non-cryptographer reader can understand why BTX matters in ~3 minutes.

Target repo: **pageified-storage** (the site that hosts Category Labs research pages).
Target deliverable: a new landing page for the BTX paper, implemented in the repo's existing framework and design system.

## About the Design Files

The files bundled here are **HTML/JS prototypes** — design references, not code to ship verbatim. Each `viz/*.js` module renders a section into a placeholder `<div>` in the root HTML using vanilla DOM + SVG + Web Animations API. Treat them as pixel-perfect specs for the visual and interaction behavior; **port them into the pageified-storage codebase using its existing framework** (React + whatever styling system the repo uses — check `src/` in that repo for current patterns).

When you (Claude Code) run, start by:
1. Cloning / reading `pageified-storage` to discover its framework, component patterns, routing, and design tokens.
2. Re-reading this README + the HTML prototypes.
3. Reimplementing each section as a component in the repo's idiom.
4. Opening a PR.

## Fidelity

**High-fidelity.** Colors, typography, spacing, animations, interactions, and copy are all final. The HTML should be recreated pixel-perfectly, mapped onto the repo's existing component primitives and design tokens where equivalents exist.

Where the repo already defines tokens (e.g. accent colors, type scale), prefer those over the raw hex values below — but check that they match. Where the repo lacks a token, introduce one using the values in the Design Tokens section.

## Page structure

The page is a single vertical scroll with 6 sections, each a full-width `<section>` alternating between two background colors for rhythm:

| # | Section id | Background | Purpose |
|---|---|---|---|
| 1 | `hero-root` | `--surface` | Title, tagline, CTA, right-side end-to-end pipeline diagram |
| 2 | `problem-root` | `--surface` | "Why encrypted mempools are hard" — interactive catalog of prior schemes' failure modes |
| 3 | `comparison-root` | `--surface-elevated` (alt) | Comparison table across 4 properties, column-hover explainers |
| 4 | `properties-root` | `--surface` | 2×2 grid: BTX's four properties with mini-vizes |
| 5 | `construction-root` | `--surface-elevated` (alt) | "The construction, at a glance" — ciphertext formula, committee flow animation, FFT trick |
| 6 | `benchmarks-root` | `--surface` | Headline speedups + interactive line chart of decryption cost vs batch size |

All sections reveal-on-scroll via an `IntersectionObserver` (`.reveal` → `.in`) with an 800ms cubic-bezier transform. Section padding is `96px 24px`, max content width `1120px`.

## Sections in detail

### 1. Hero (`viz/hero.js`)
- **Left column:** eyebrow chip ("Category Labs research" with green dot), H1 (`BTX` in 300 weight + secondary color, then `Batched Threshold Encryption` in 600 weight + `--solution-accent`), lede paragraph, mono-font three-line summary, primary button ("Read the paper (PDF)") + secondary link ("Or read the explainer ↓" anchored to `#problem-root`).
- **Right column:** SVG end-to-end pipeline diagram: Users → Encrypted mempool → Builder → Committee → Block. Circles/rects for each stage, animated dots traveling along connectors on reveal. Committee node shows N servers arranged in a small ring.
- Grid: `minmax(0, 0.85fr) minmax(0, 1.15fr)` with `gap: 64px`, collapses to single column below 780px.
- Section `min-height: 92vh`, flex-centered.

### 2. Problem — interactive failure modes (`viz/problem.js`)
- Intro: "Why encrypted mempools are hard" + lede.
- Two-column layout: left is a vertical list of 6 scheme buttons, right is a canvas that swaps to an illustration of the selected scheme's failure.
- **Scheme list buttons** (`.scheme-btn`): scheme name + mono-font failure tag. Active state uses `--solution-bg` + accent border + 3px tinted ring.
- **6 schemes, each with its own animated canvas:**
  1. **Naïve threshold encryption** — O(N·B) comms: SVG with N validator dots on the left, B ciphertext bars on the right, full bipartite connection mesh. Message count displayed mono.
  2. **Threshold IBE** — all-or-nothing: 48-cell grid where ~12 cells are "ciphertexts of interest"; a "Release epoch key" button cascades every cell to the solution color → all are revealed → `✗ all 48 revealed`.
  3. **Early BTE (per-block MPC)** — too slow: two stacked bars, "Block time budget" (~400ms filled to 20% in solution accent) vs "MPC setup ceremony" (animates to 420% width in problem accent — intentionally overflows).
  4. **Indexed BTE (BEAT-MEV)** — index collision: looping animation of Alice and Attacker both publishing to "idx 7"; Alice's ct fades out when attacker's lands.
  5. **TrX** — CRS grows forever: progress bar that auto-increments block counter and CRS size (32 KB → unbounded); loops.
  6. **PFE** — expensive: side-by-side ciphertext layouts. PFE = `G₁ · G₁ · G_T` with "4 pairings per open · 0.723 ms/ct". BTX = `G₁ · G_T` with "1 pairing per open · 0.171 ms/ct".
- Below the canvas: a pill "BTX fills the gap" card in `--solution-bg` with a green checkmark badge.

### 3. Comparison table (`viz/comparison.js`)
- Table columns: Scheme | Collision-free | Epochless | Decryption cost | Ciphertext
- Rows (one per scheme): Batched IBE, TrX, BEAT-MEV, Gong et al., BEAT++, PFE, **BTX (highlighted)**.
- ✓ and ✗ rendered as 22px colored circles (solution green / problem orange). Partial support uses a `✓/✗` pill.
- **BTX row is highlighted:** `--solution-bg` background, 2px solution-accent top + bottom border, scheme name bold in solution accent.
- **Column headers are hover-interactive:** hovering a property column highlights all cells in that column (8% solution tint) and updates an explainer panel below the table with a short description (see EXPLAIN dict in `viz/comparison.js`).
- Footnote: `B = actual batch size, Bmax = maximum supported. |G₁|, |G_T| are group element sizes (BLS12-381). Adapted from BTX, Table 1.`

### 4. Four properties (`viz/properties.js`)
2×2 grid of cards (collapses to 1 column below 780px). Each card:

- **P1 · Compact:** Animated horizontal bars comparing ciphertext size across 3 scheme families. Each bar is composed of colored segments labeled `G₁` or `G_T`, scaled by byte size. BTX row is highlighted. Segments animate in with `scaleX` from 0 → 1 on reveal, staggered 60ms each.
- **P2 · Collision-free:** Two-tab toggle (Indexed BTE / BTX). Each tab shows two tracks (Alice / Attacker) with ciphertext labels traveling along them. In Indexed mode, ct_A fades out when attacker's lands; in BTX mode, both succeed. Auto-cycles every ~10s.
- **P3 · Epochless:** Two rows (Epoch-bound BTE / BTX). Each row shows Block N → Block N+1. In Epoch-bound row, ciphertext tagged N → expires in N+1. In BTX row, ct → still valid in N+1. Cross-fades between rows.
- **P4 · Fast · dynamic batch sizing:** Slider labeled "Actual batch B" (16–512, step 16, default 128). Below: two bars, "Prior · O(Bmax log Bmax)" (always full, problem-accent striped) and "BTX · O(B log B)" (width scaled to actualCost/maxCost). Caption updates to show savings % ("Prior schemes pay for 90% max every block"). Slider is bound to shared `window.__bte.B` so the Tweaks panel syncs.

### 5. Construction (`viz/construction.js`)
- **1. Encryption:** Two-column. Left = prose explanation. Right = card with mono-font formula `ct = [r]₁, m + r · ek`. The two ciphertext components animate in (fade + translateY) on reveal. Legend below divides them into "[r]₁ — randomness in G₁" and "m + r · ek — masked message in G_T". Footnote: "Core size: |G₁| + |G_T|. A short Schnorr NIZK rides alongside for CCA security."
- **2. Committee decryption:** SVG animation (640×280 viewBox). Three column labels: CIPHERTEXTS / COMMITTEE / PLAINTEXTS. Left stack: 5 ciphertext rectangles fade in. Center: ring of N server dots (reads from `window.__bte.N`). Right stack: 5 plaintext rectangles. On replay: ciphertexts travel to center (dots animating along paths), each server lights up + emits a pulse to the combiner, then plaintexts emerge. Replay button at bottom. Speed is governed by `window.__bte.speed`.
- **3. The speed trick:** Card with `--solution-bg`. Two 8×8 cell grids side-by-side: "Naïve: O(B²)" fully saturated, "BTX FFT: O(B log B)" with only the diagonal + log² entries highlighted. Text explains the middle-product-via-FFT insight.

### 6. Benchmarks (`viz/benchmarks.js`)
- **Two headline cards** (top, 2-column grid):
  - Total decryption · B=512: `2.0× faster overall`, PFE 1197 ms vs BTX 598 ms bars.
  - Open phase · per ciphertext: `4.2× faster per ct · 1 pairing vs 4`, PFE 0.723 ms/ct vs BTX 0.171 ms/ct bars.
  - Bars animate from 0 → target width on reveal (0.9s cubic-bezier, 0.2s stagger).
- **Line chart card** (640×280 SVG):
  - X-axis: batch size (32, 64, 128, 256, 512) on a log scale.
  - Y-axis: ms/ct, 0 to 1.8 with gridlines at 0.5 intervals.
  - Two lines: PFE precompute (problem accent), BTX precompute (solution accent). Filled area between them in 8% solution tint.
  - Dots at each data point (hollow, stroked).
  - Stroke-dashoffset draw-on animation on reveal (1.2s).
  - Hover: vertical hairline snaps to nearest data point; 4-column readout below shows B / PFE / BTX / speedup.
  - Data (from BTX Table 4):

| B | PFE precompute (ms/ct) | BTX precompute (ms/ct) | PFE open | BTX open |
|---|---|---|---|---|
| 32 | 0.963 | 0.644 | 0.721 | 0.171 |
| 64 | 1.120 | 0.722 | 0.721 | 0.171 |
| 128 | 1.278 | 0.801 | 0.721 | 0.171 |
| 256 | 1.436 | 0.880 | 0.722 | 0.171 |
| 512 | 1.596 | 0.959 | 0.723 | 0.171 |

- Footnote: `Intel Xeon Platinum 8488C (3.8 GHz), blst over BLS12-381 with AVX-512, Clang 21.1.8. Per-ciphertext from BTX Table 4; totals from the abstract.`

## Tweaks panel (developer-facing, optional for production)

The prototype exposes a floating Tweaks panel (bottom-right) with three sliders that broadcast through a shared `window.__bte` state to every viz: committee size N (3–9), batch size B (16–512), motion speed (0.5×–2×). This is a design-tool affordance and can be **omitted from the production page** unless the team wants to ship it as a live playground. If keeping, hide it behind a querystring toggle or dev flag.

## Design Tokens

All colors are from Category Labs' existing palette (the prototype lifted them from `globals.css`).

```css
/* Problem (prior schemes) palette */
--problem-bg: #fdf6ef;
--problem-accent: #c4653a;
--problem-accent-strong: #b05226;
--problem-accent-light: #f0d9c8;
--problem-muted: #a8856e;
--problem-cell: #ede0d4;

/* Solution (BTX) palette */
--solution-bg: #f0f7f5;
--solution-accent: #2a7d6a;
--solution-accent-light: #c8e6df;
--solution-muted: #6da396;
--solution-cell: #d4e8e2;

/* User (neutral third) palette — for user/actor accents */
--user-bg: #edf3fc;
--user-accent: #3b7dd8;
--user-accent-light: #b8d4f0;

/* Surfaces + text */
--surface: #f8f6f3;
--surface-elevated: #ffffff;
--border: #e2ddd7;
--border-soft: #ede8e1;
--text-primary: #1a1714;
--text-secondary: #6b6259;
--text-tertiary: #8a7d6f;
```

### Type

```css
--sans: 'IBM Plex Sans', system-ui, sans-serif;   /* 300, 400, 500, 600, 700 */
--mono: 'IBM Plex Mono', ui-monospace, monospace; /* 400, 500, 600 */
```

- H1: `clamp(2.5rem, 4.5vw, 3.5rem)`, line-height 1.05, letter-spacing -0.02em
- H2: `clamp(1.75rem, 3vw, 2.25rem)`, weight 600, letter-spacing -0.015em
- H3: 1.15rem, weight 600
- Lede: 1.075rem, weight 300, color `--text-secondary`, line-height 1.6, max-width 46rem
- `.tag` (eyebrow): mono, 10.5px, letter-spacing 0.08em, uppercase, weight 600, color `--solution-accent`
- Body: `--sans`, weight 400, text-wrap: pretty, balance on headings

### Radii / shadows / borders
- Card radius: 14px. Inner element radius: 8–10px. Pills: 999px.
- `.card`: `--surface-elevated` bg, 1px `--border`, 14px radius, 22px padding.
- `.card.solution`: `--solution-bg` bg, solution-accent border at 22% opacity.
- `.card.flat`: `--surface` bg.
- No heavy shadows. Tweaks panel uses `0 20px 40px -20px rgba(26,23,20,0.2)`.

### Motion
- Section reveal: `opacity 0 → 1, translateY(24px → 0)`, 800ms, `cubic-bezier(0.16,1,0.3,1)`, `threshold: 0.1`.
- Bar growth: 0.9s `cubic-bezier(0.16,1,0.3,1)`, 0.2s stagger.
- Chart line draw: 1.2s `cubic-bezier(0.3,0,0.2,1)` via stroke-dashoffset.
- SVG flow dots: 400–500ms `cubic-bezier(0.3,0,0.2,1)`.
- Hover transitions: 0.15–0.2s.

## Interactions & behavior

- **Scroll-driven reveal** for every section via IntersectionObserver.
- **Problem section:** click a scheme button → canvas swaps, previous animation loop is stopped (each renderer returns a teardown fn).
- **Comparison:** hover a column header → column cells tint + explainer panel updates; leave → revert.
- **Properties P1:** reveal-triggered segment cascade.
- **Properties P2, P3:** auto-looping animations with `requestAnimationFrame + setTimeout`.
- **Properties P4:** slider input → re-render bars + caption percent.
- **Construction:** ciphertext formula reveals on scroll; committee animation plays once on first reveal, then replay button re-triggers.
- **Benchmarks:** chart hover hairline + readout; bars animate on reveal.
- **Anchor scroll:** "Or read the explainer ↓" link goes to `#problem-root`.

## Responsive behavior

Single breakpoint at **780px**. Below that, all 2-column grids collapse to 1 column:
- Hero grid
- Problem scheme-list + canvas
- Construction split
- Properties grid (2×2 → 1×4)
- Benchmark headline grid

The SVGs use `viewBox` + `width: 100%` so they scale fluidly.

## Accessibility notes

- All interactive buttons (scheme list, property tabs, replay) are `<button>` elements.
- Color is not the sole differentiator — ✓/✗ marks and explicit text labels accompany every color cue.
- Column-header hover in the comparison table should also work on keyboard focus (not currently in the prototype — **please add** in production).
- `prefers-reduced-motion`: the prototype does not honor this yet — **please add** a media query that disables reveal animations and auto-looping vizes (P2, P3, CRS, collision).

## State management

Shared reactive state in `window.__bte` (prototype-only — replace with a proper context / store in production):

```js
window.__bte = {
  N: 5,       // committee size (3–9)
  B: 128,     // batch size (16–512)
  speed: 1.0, // animation speed multiplier (0.5–2)
  listeners: Set,
  subscribe(fn), set(key, val)
}
```

Most sections read static data (scheme list, comparison rows, benchmark table); only the Committee decryption animation and Property 4 slider are reactive to `__bte`. In production, model these as component props with defaults; no global store required.

## Assets

- **Fonts:** IBM Plex Sans + IBM Plex Mono, Google Fonts. The target repo likely already hosts these — prefer its font setup.
- **No image or icon assets.** All marks (✓, ✗, →, checkmark badge) are inline Unicode or inline SVG paths. The hero CTA arrow is an inline SVG.

## Files in this bundle

- `BTE Redesign.html` — root HTML, design tokens in `<style>`, shared state + reveal observer, script tags loading each `viz/*.js`.
- `viz/hero.js` — Section 1.
- `viz/problem.js` — Section 2.
- `viz/comparison.js` — Section 3.
- `viz/properties.js` — Section 4.
- `viz/construction.js` — Section 5.
- `viz/benchmarks.js` — Section 6.

## PR checklist for Claude Code

1. Clone `pageified-storage`; inspect its framework (React? Next? something else?), component directory, styling approach, routing.
2. Add a new route/page for the BTX paper (e.g. `/research/btx` or whatever the repo's convention is).
3. Port each section into that page as a component. Recommended file layout mirrors `viz/`:
   ```
   components/btx/
     BtxHero.tsx
     BtxProblem.tsx
     BtxComparison.tsx
     BtxProperties.tsx
     BtxConstruction.tsx
     BtxBenchmarks.tsx
     shared.ts  // scheme data, benchmark rows
   ```
4. Map design tokens to the repo's token system where they overlap; introduce new tokens only when necessary.
5. Replace `window.__bte` with local component state / context (or remove the Tweaks affordance entirely if not wanted).
6. Add a `prefers-reduced-motion` guard and keyboard focus styles for the comparison-header hover.
7. Verify layout at ≥1440, 1024, 768, and 375 widths.
8. Open a PR titled e.g. `Add BTX paper landing page` with before/after screenshots.
