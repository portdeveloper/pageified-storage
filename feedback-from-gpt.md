# Feedback From GPT

This note summarizes factual issues and source-backed guidance for the current explainer repo, based on a review of the local `/mip-8` and `/mip-3` pages plus the underlying source files.

## Sources checked

- MIP-8: https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-8.md
- MIP-8 forum thread: https://forum.monad.xyz/t/mip-8-page-ified-storage-state/407
- MIP-3: https://github.com/monad-crypto/MIPs/blob/main/MIPS/MIP-3.md
- MIP-3 forum thread: https://forum.monad.xyz/t/mip-3-linear-evm-memory-cost/362
- Solidity storage layout: https://docs.soliditylang.org/en/v0.6.8/internals/layout_in_storage.html
- Ethereum trie docs: https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie
- EIP-2200: https://eips.ethereum.org/EIPS/eip-2200
- EIP-2929: https://eips.ethereum.org/EIPS/eip-2929

## High-level guidance

- Be careful to distinguish:
  - Solidity logical storage layout
  - trie/backend locality
  - currently live Monad gas rules
  - proposed MIP behavior
- Several claims are directionally right but too absolute.
- Several current pages mix "proposal" language with "current Monad behavior" language.

## MIP-8 page feedback

### What is correct

- It is correct to say normal struct fields are laid out contiguously in Solidity.
- It is also correct to say trie/backend hashing can destroy that locality underneath.
- A good phrasing is:
  - "Struct fields are contiguous in Solidity storage layout, but trie/backend hashing can still destroy locality."

### What is not fully correct right now

1. Absolute locality wording

- Current rendered copy says or implies things like:
  - each struct field hashes to a different backend page
  - the trie/backend hashes each slot to a different physical location
- That is too strong.
- Better:
  - "can lose locality"
  - "in a worst-case illustration, related fields can land on separate backend pages"

2. Absolute 4 KB read wording

- Copy like "The storage engine touches 4,096 bytes for a 32-byte read" is too absolute.
- MIP-8 motivates itself with page-sized backend I/O, but this should be framed as:
  - "may touch"
  - "can end up touching"
  - "backend may fetch an entire 4 KB page"

3. Monad-specific `8,100 / 100` storage constants

- The current MIP-8 frontend now contains multiple claims like:
  - "Uses Monad's 8,100/100 cold-vs-warm constants"
  - gas calculators using `8,100` cold SLOAD and `100` warm read as if this is current settled Monad behavior
- I would not sign off on that as written.
- What I could verify:
  - an older Monad initial-spec PDF proposed cold storage access numbers including `8100`
  - the Monad forum update on October 24, 2025 says version 2.0.0 removed the storage-related pricing changes from that proposal
  - MIP-8 itself is still a proposal with abstract page-level costs, not current live chain behavior
- Safer options:
  - use Ethereum's `2100 / 100` constants explicitly as an illustration
  - or say `historical Monad proposal constants`
  - or remove concrete Monad numbers unless there is a current official source for them

4. Write-cost examples

- Any exact MIP-8 write numbers are unsafe unless directly sourced.
- MIP-8 defines abstract page-write and state-growth parameters.
- The write examples should remain qualitative unless backed by a current official implementation/spec source.

### Specific files worth revisiting

- `src/components/ComparisonSection.tsx`
- `src/components/SolutionSection.tsx`
- `src/components/GasCalculatorSection.tsx`
- `src/components/StepperSection.tsx`
- `src/components/CherryPickedSection.tsx`
- `src/components/UniswapV2Section.tsx`

## MIP-3 page feedback

### Material issues found

1. Wrong footer content

- The current `/mip-3` page renders the shared footer, but that footer still points to:
  - MIP-8 spec
  - MIP-8 forum thread
  - MIP-8/MIP-9 "what's next" copy
- This is plainly wrong for the MIP-3 route.
- File:
  - `src/components/FooterSection.tsx`

2. Outdated / incorrect failure semantics

- The MIP-3 compatibility section says exceeding the 8 MB limit:
  - "reverts (returning unspent gas to the parent)"
- The public MIP-3 forum thread later updated this point.
- On February 3, 2026, the author posted an updated spec note saying:
  - if a memory access exceeds the 8 MB limit, the call terminates with `OutOfGas`
  - the immediate call context fails
  - no gas is returned to the parent call
- So the current page is not safe on this point.
- File:
  - `src/components/mip3/Mip3CompatibilitySection.tsx`

3. Incorrect 2 KB number

- The compatibility copy says average memory usage is around 2 KB, which drops from `198 gas` to `32 gas`.
- With the formula used everywhere else on the page:
  - 2 KB = 2048 bytes = 64 words
  - current quadratic cost = `64^2 / 512 + 3*64 = 8 + 192 = 200`
  - MIP-3 cost = `64 / 2 = 32`
- So the correct statement is `200 gas to 32 gas`, not `198 gas to 32 gas`.
- File:
  - `src/components/mip3/Mip3CompatibilitySection.tsx`

4. "Only the gas cost of expansion changes" is too narrow

- MIP-3 is not only a repricing.
- It also introduces:
  - an explicit 8 MB cap
  - a shared memory pool across call contexts / peak-memory rule
- So this should be phrased more carefully.
- File:
  - `src/components/mip3/Mip3CompatibilitySection.tsx`

### Numeric claims that do look correct

- `words^2 / 512 + 3*words` for the current model is correct for the explainer.
- `words / 2` for MIP-3 is correct per the MIP-3 spec.
- `1 MB -> 16,384 gas` under MIP-3 is correct.
- `8 MB cap` is correct.
- `~2 KB average` and `~2 MB historical max` are supported by MIP-3 and the forum thread.
- `~3.85 MB` being around the ETH block-limit threshold is directionally consistent with the formula used on the page.

### Specific MIP-3 files worth revisiting

- `src/components/mip3/Mip3CompatibilitySection.tsx`
- `src/components/FooterSection.tsx`

## Suggested copy style

- Prefer `can`, `may`, `typically`, `in this illustration`, `if adopted`, `proposal`, `historical`, `current Ethereum constants`, etc.
- Avoid presenting proposal economics as live-chain facts unless there is an up-to-date official source.

## Short version

- MIP-8:
  - locality story is basically right
  - current Monad `8100/100` framing is not safe as written
  - avoid absolute wording about physical/backend placement

- MIP-3:
  - formulas are mostly right
  - footer is wrong
  - 2 KB number should be `200 -> 32`
  - failure semantics need updating to match the later forum clarification
