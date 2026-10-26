# TASK-008: Legacy-chain replay warnings

Status: Complete

Requirement: REQ-007

## Scope

- Check exact unspent outputs against mempool.space's Bitcoin mainnet API.
- Mark each shared Coin Control UTXO and show pending/failed states.
- Show selected-input status in Send and freshly check actual coin-selected inputs before signing.
- Require explicit replay-risk acknowledgement for all-shared inputs and unknown checks. Failed checks explain the uncertainty and allow informed continuation; cancellation stops signing.
- Retain existing transaction signing, review, broadcast, wallet data, and dependencies.
- Translate all seven replay-check strings in every supported app locale and record terminology in the locale vocabularies.

## Verification

- Failing tests were written before implementation; malformed successful transaction responses were also reproduced before the fix.
- Seven Jest suites / 82 tests passed, covering exact matching, spent/missing outputs, malformed responses, API failures, HTTP/body timeouts, bounded concurrency, and fresh queries.
- The failed-check acknowledgement update passed four focused Jest suites / 52 tests, including awaiting explicit acknowledgement, cancellation, informed continuation to signing/review, and invalidation after a recipient change.
- Replay localization now supplies all 497 values (seven strings × 71 locales), adding 476 translations and 68 terminology entries. The new coverage test failed for the 68 missing locales before translation; six focused suites / 141 tests passed after completion, including switching through every actual language loader and checking original JSON values before fallback.
- Rendered-screen tests cover Coin Control's frozen outputs, Send's all-shared warning, actual/automatic coin selection, acknowledgement before signing, cancellation, query failure, changed input/amount/recipient, and unmounting.
- `npm run lint` passed, including TypeScript, localization checks, metadata validation, and ESLint. Existing formatting warnings in unrelated tests remain.
- `git diff --check` passed. Two read-only requests using the public genesis transaction verified the live mempool.space transaction/outspends response shapes.
- No device build or live signing/broadcast was performed.
- The isolated iOS simulator demo was updated and verified: the failed-check warning offers cancellation or explicit acknowledgement, and acknowledgement reaches the demo result screen using a fixture wallet without signing or broadcasting.
- Translation coverage, source-language leakage, key presence, brand/unit preservation, and runtime language switching are checked automatically. These checks do not constitute native-speaker review or visual validation of every locale.
