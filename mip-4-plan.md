# MIP-4: Reserve Balance Introspection - Implementation Plan

## Background

Monad separates consensus from execution with a 3-block lag (~1.2s). When block N is proposed,
the leader only has state from block N-3. To prevent spam from transactions that appear valid
on stale state but fail on execution, Monad reserves 10 MON per EOA as a gas fee budget.

MIP-4 adds a precompile at `0x1001` with `dippedIntoReserve()` that returns whether any
account's balance has dropped below the 10 MON reserve threshold during the current execution.

## Key Claims to Fact-Check

### Claim 1: Precompile at address 0x1001
**Source needed:** MIP-4 spec, monad-revm abi.rs

### Claim 2: `dippedIntoReserve()` selector is `0x3a61584e`
**Source needed:** MIP-4 spec, monad-revm abi.rs

### Claim 3: Gas cost is 100
**Source needed:** MIP-4 spec, monad-revm abi.rs

### Claim 4: Reserve balance threshold is 10 MON (10e18 wei)
**Source needed:** monad-revm tracker.rs DEFAULT_RESERVE_BALANCE

### Claim 5: Check is O(1) via incremental tracking (failed set)
**Source needed:** monad-revm tracker.rs has_violation()

### Claim 6: Only CALL works (STATICCALL, DELEGATECALL, CALLCODE revert)
**Source needed:** MIP-4 spec, monad-revm mod.rs

### Claim 7: Reverts consume all gas (precompile behavior)
**Source needed:** MIP-4 spec

### Claim 8: "Emptying exception" - first tx in k blocks can spend below reserve
**Source needed:** MIP-4 spec or Monad docs

### Claim 9: Smart contracts (non-delegated) are exempt from reserve balance
**Source needed:** monad-revm tracker.rs

### Claim 10: Check is global across all touched accounts, not just caller
**Source needed:** MIP-4 spec

---

## Sections

### 1. Hero
- Title: "What if contracts could detect reserve violations mid-execution?"
- Subtitle about Monad's async execution creating the need for reserve balance
- Visual: animated balance bar dropping below the 10 MON line

### 2. Why Reserve Balance Exists
- Monad's 3-block async pipeline visualization
- Block N-3 (stale state) vs Block N (current execution)
- Show why 10 MON reserve prevents spam
- This is unique context needed before explaining the precompile

### 3. The Problem (without MIP-4)
- Bundler processes 5 UserOps
- UserOp #3 causes reserve violation
- Entire transaction reverts - no diagnostic, no partial recovery
- All 5 ops wasted

### 4. The Solution (with MIP-4)
- Same bundler, same 5 UserOps
- After each UserOp, call dippedIntoReserve()
- Detect violation at UserOp #3, revert just that one
- UserOps 1, 2, 4, 5 succeed
- Side-by-side or sequential comparison

### 5. Interactive Transaction Timeline
- Show 3 accounts with starting balances
- Step through operations (transfers, swaps)
- 10 MON reserve line visible on each account
- Red/green violation indicators updating in real-time
- "Call dippedIntoReserve()" button at any point showing true/false
- on_credit can restore an account (indicator turns green)

### 6. Compatibility / Technical Details
- Only CALL works (not STATICCALL/DELEGATECALL)
- 100 gas cost
- Reverts consume all gas
- Smart contracts exempt from reserve
- Emptying exception for first tx

---

## Fact-Check Results (all verified 2026-03-24)
- [x] Precompile at 0x1001: confirmed via monad-revm abi.rs `RESERVE_BALANCE_ADDRESS`
- [x] Selector 0x3a61584e: confirmed via monad-revm abi.rs `DIPPED_INTO_RESERVE_SELECTOR`
- [x] 100 gas cost: confirmed via monad-revm abi.rs `DIPPED_INTO_RESERVE_GAS`
- [x] 10 MON reserve: confirmed via monad-revm abi.rs `DEFAULT_RESERVE_BALANCE = 10e18`
- [x] O(1) tracking: confirmed via tracker.rs `has_violation() = !self.failed.is_empty()`
- [x] CALL-only: confirmed via mod.rs (rejects DelegateCall, StaticCall, CallCode, is_static)
- [x] Reverts consume all gas: confirmed via mod.rs `revert_result` records full gas_limit
- [x] Emptying exception: confirmed via tracker.rs `sender_can_dip` flag → threshold 0
- [x] Smart contract exemption: confirmed via tracker.rs `is_subject_account` checks code hash
- [x] Global check: confirmed via tracker.rs `failed` set populated by on_debit/on_credit for any address
