# TASK-008: Legacy-chain replay warnings

Status: Complete

Requirement: REQ-007

## Scope

- Check exact unspent outputs against mempool.space's Bitcoin mainnet API.
- Mark each shared Coin Control UTXO and show pending/failed states.
- Show selected-input status in Send and freshly check actual coin-selected inputs before signing.
- Require explicit replay-risk acknowledgement for all-shared inputs; cancel/unknown results stop signing.
- Retain existing transaction signing, review, broadcast, wallet data, and dependencies.

## Verification

- Failing tests were written before implementation; malformed successful transaction responses were also reproduced before the fix.
- Seven Jest suites / 82 tests passed, covering exact matching, spent/missing outputs, malformed responses, API failures, HTTP/body timeouts, bounded concurrency, and fresh queries.
- Rendered-screen tests cover Coin Control's frozen outputs, Send's all-shared warning, actual/automatic coin selection, acknowledgement before signing, cancellation, query failure, changed input/amount/recipient, and unmounting.
- `npm run lint` passed, including TypeScript, localization checks, metadata validation, and ESLint. Existing formatting warnings in unrelated tests remain.
- `git diff --check` passed. Two read-only requests using the public genesis transaction verified the live mempool.space transaction/outspends response shapes.
- No device build or live signing/broadcast was performed.
