# MIP-3: Linear Memory - Implementation Plan

## Key Claims to Fact-Check

### Claim 1: Ethereum's quadratic memory cost formula
```
memory_size_word = (memory_byte_size + 31) // 32
memory_cost = (memory_size_word ** 2) // 512 + 3 * memory_size_word
```
**Source needed:** Ethereum Yellow Paper, go-ethereum source, or EIP-2929

### Claim 2: MIP-3's linear cost formula
```
memory_cost = memory_size_word // 2
```
(0.5 gas per 32-byte word)
**Source needed:** MIP-3 spec, monad-revm source code

### Claim 3: 8 MB hard cap per transaction
- 8,388,608 bytes = 262,144 words
- Cost to fill: 262,144 / 2 = 131,072 gas
**Source needed:** MIP-3 spec

### Claim 4: Child calls share memory pool with parent, released on return
**Source needed:** MIP-3 spec, monad-revm memory module

### Claim 5: Memory limit violation causes revert (not exceptional halt)
Important for ERC-4337 compatibility.
**Source needed:** MIP-3 spec

### Claim 6: Gas comparison table
| Size | Words | ETH Quadratic | MIP-3 Linear | Ratio |
|------|------:|-------------:|-----------:|------:|
| 1 KB | 32 | 98 | 16 | 6.1x |
| 10 KB | 320 | 1,160 | 160 | 7.2x |
| 100 KB | 3,200 | 29,600 | 1,600 | 18.5x |
| 1 MB | 32,768 | 2,195,456 | 16,384 | 134x |
| 8 MB | 262,144 | 135,004,160 | 131,072 | 1,030x |

**Need to verify each row by hand calculation.**

Manual verification of 1 KB row:
- 1 KB = 1,024 bytes → words = ceil(1024/32) = 32
- ETH: 32²/512 + 3*32 = 1024/512 + 96 = 2 + 96 = 98 ✓
- MIP-3: 32/2 = 16 ✓
- Ratio: 98/16 = 6.125 ✓

Manual verification of 1 MB row:
- 1 MB = 1,048,576 bytes → words = 32,768
- ETH: 32768²/512 + 3*32768 = 1,073,741,824/512 + 98,304 = 2,097,152 + 98,304 = 2,195,456 ✓
- MIP-3: 32768/2 = 16,384 ✓
- Ratio: 2,195,456/16,384 = 134.0 ✓

Manual verification of 8 MB row:
- 8 MB = 8,388,608 bytes → words = 262,144
- ETH: 262144²/512 + 3*262144 = 68,719,476,736/512 + 786,432 = 134,217,728 + 786,432 = 135,004,160 ✓
- MIP-3: 262144/2 = 131,072 ✓
- Ratio: 135,004,160/131,072 = 1,030.0 ✓

### Claim 7: ETH practical limit is ~3.85 MB at 30M gas
- Solve: words²/512 + 3*words = 30,000,000
- At 3.85 MB = 3,854 KB = 123,330 words (approx)
- 123330²/512 + 3*123330 = 15,210,288,900/512 + 369,990 = 29,707,596 + 369,990 ≈ 30,077,586
- Close to 30M. ✓ (approximate)

---

## Sections

### 1. Hero
- Title: "What if memory cost scaled linearly?"
- Subtitle: "EVM memory gets 134x cheaper at 1 MB. MIP-3 replaces the quadratic cost curve with a flat rate."
- Visual: animated counter showing quadratic cost climbing vs linear staying flat

### 2. Cost Curve Comparison (core interactive)
- Logarithmic slider: 32 bytes → 8 MB
- Two lines/bars: quadratic (warm/red) vs linear (cool/teal)
- Dynamic readout: exact gas for each, ratio, savings %
- Markers at key thresholds:
  - 2 KB (average historical usage)
  - 2 MB (historical max)
  - ~3.85 MB (ETH block limit ceiling)
  - 8 MB (MIP-3 cap)
- Formula display for both models

### 3. Gas Calculator (scenario dropdown)
Scenarios:
1. "ABI-encode a struct (1 KB)" - 98 → 16 gas (6x)
2. "Batch process 100 txs (100 KB)" - 29,600 → 1,600 gas (18.5x)
3. "On-chain data decompression (1 MB)" - 2,195,456 → 16,384 gas (134x)
4. "Full 8 MB allocation" - IMPOSSIBLE → 131,072 gas
5. "Typical usage (2 KB)" - 198 → 32 gas (6.2x)

### 4. Memory Pool Visualization
- Show 8 MB bar as a container
- Animate: Contract A allocates 1 MB → bar fills
- A calls B → B gets remaining 7 MB available
- B allocates 2 MB → bar fills more
- B returns → B's 2 MB released back
- Show remaining pool counter at each step
- Highlight: "Memory is released on return, not lost"

### 5. Takeaways (3 cards)
1. "Predictable costs" - Linear means doubling memory doubles cost. No quadratic surprises.
2. "Large buffers are feasible" - 1 MB costs 16K gas. On-chain sorting, compression, proof verification become practical.
3. "Shared memory pool" - Child calls borrow from the same 8 MB pool. Memory is released on return, not wasted.

### 6. Compatibility
- Same opcodes (MLOAD, MSTORE, MSTORE8, MCOPY all work identically)
- Memory limit exceeded → revert (ERC-4337 safe)
- Existing contracts get cheaper, not broken
- Only risk: contracts hardcoding gas assumptions about memory costs

---

## Fact-Check Results (all verified 2026-03-24)
- [x] Quadratic formula: confirmed via go-ethereum gas_table.go (MemoryGas=3, QuadCoeffDiv=512)
- [x] MIP-3 linear formula: confirmed via MIP-3 spec + monad-revm `monad_memory_cost(words) = words >> 1`
- [x] 8 MB cap: confirmed via MIP-3 spec + monad-revm `MONAD_MEMORY_LIMIT = 8 * 1024 * 1024`
- [x] Revert behavior: confirmed via MIP-3 spec + monad-revm `MemoryLimitOOG` (revert, not halt)
- [x] Memory pooling: confirmed via MIP-3 spec + REVM SharedMemory infrastructure
- [x] Gas calculation rows: all 5 rows manually verified
