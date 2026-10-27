# TASK-008: Reject immature Coinbase inputs

Status: Complete

## Scope

- Classify txid-verified raw creating transactions using bitcoinjs-lib and existing Electrum caches/batching.
- Keep unknown/immature funds visible while excluding them from synchronous shared selection and transaction construction.
- Use the 100-confirmation consensus boundary with actual Electrum headers and freshly verified heights; invalidate height trust across tip changes and reconnects.
- Cover all LegacyWallet descendants, watch-only and multisig delegation, Send Max, fee estimation, manual selection, PSBT, RBF/CPFP and notification payments.
- Preserve total balance, ordinary unconfirmed spending, storage, derivation and signing semantics.

## Verification

Regression tests cover detection, cache reuse, unknown retries, batch isolation/deduplication, maturity boundaries, frozen inputs, rollback, same-height reorg, reconnect, stale tip data, wallet refresh and shared construction guards. Existing ordinary-input fixtures explicitly carry their known classification where raw data is absent.

- Full unit suite: 62 suites passed; Jest reports 582 passed and 1 skipped. Existing mnemonic-gated tests also return early when their environment variables are absent; those bodies were not executed.
- TypeScript (`tsc --noEmit`): passed.
- Repository `npm run lint`: passed with three pre-existing Prettier warnings in `tests/integration/ElectrumClient.test.js` and `tests/unit/default-services.test.ts`. ESLint on changed files: clean.
- Online `legacy-wallet`, `watch-only-wallet` and `hd-segwit-bech32-transaction` integration suites: passed (Jest reports 23 passed, 2 skipped); five mnemonic-gated transaction cases return early and were not executed. Offline mocked integration actually exercises mature Coinbase signing, RBF bump/cancel, CPFP, rollback, caching and retries.
- Online multisig integration: existing fixed-balance assertion fails (`108880` expected, `0` returned). Reproduced with the original HEAD source before the repair, confirming the same failure is present on the baseline.
- Original-source regression probe: the old selector accepts manually supplied Coinbase inputs instead of rejecting them; the guarded selector regression passes after this repair.
- `git diff --check`: passed. No native device/hardware signing, real-funds broadcast or complete network integration suite was run.
- Jest warns about outstanding asynchronous handles; online integration runs used `--forceExit` after completing the tests.
