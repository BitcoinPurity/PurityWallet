# TASK-011: Preserve Coin Control access for immature-only wallets

Status: Complete

## Scope

- Count all owned UTXOs in Wallet Details using the existing `getUtxo(true)` contract.
- Keep Coin Control accessible when all outputs are immature, unknown or frozen.
- Preserve synchronous spendability checks and transaction construction policy.

## Verification

A real public mining address has an immature Coinbase UTXO and exposed a zero-count entry regression during emulator verification. Two regression cases failed against the old count (immature-only and mixed ineligible outputs); the empty-wallet case passed.

- Unit tests: 65 suites passed; 600 tests passed and 1 skipped. Jest reported an open-handle warning after completion.
- TypeScript and repository lint passed, with three existing Prettier warnings in unrelated tests.
- Android emulator: Wallet Details shows Coins=1 for the immature-only public mining wallet; opening Coin Control displays the real reward with the red Immature badge.
- Android emulator: a public HD watch-only fixture opens Send in offline-signing mode; the visible Coin Control button opens the output list and the Send menu no longer contains that entry.
- No private keys were imported and no transactions were signed or broadcast. Integration and hardware-signing tests were not run for this display-only change.
