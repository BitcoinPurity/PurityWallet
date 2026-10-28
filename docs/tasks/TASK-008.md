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

## Local CI follow-up (2026-10-28)

- Ran the `ci.yml` lint, unit and complete integration jobs from an isolated checkout of `5a11fb101`, with a fresh lockfile installation on Node 24.
- The first complete integration run exposed a missing `getSpendabilityTip` method in the App test's Electrum mock. Adding a null-tip mock fixes SelfTest without changing wallet behavior or disabling spendability checks. The existing SelfTest case failed before this adjustment and passed afterward.
- TypeScript and repository lint passed after the test adjustment, with the same three existing Prettier warnings. All 65 unit suites passed (600 passed, 1 skipped), including all 52 Coinbase and Coin Control regression cases.
- The complete integration rerun reported 102 passed, 1 failed and 26 skipped (12 suites passed, 1 failed, 2 skipped). The remaining multisig fixed-balance failure was reproduced both on the current source and the pre-fix `015b45906` source using identical dependency lockfiles.
- Missing mnemonic secrets cause additional legacy test bodies to return early despite Jest reporting them as passed. Those bodies and the unavailable Exir rate assertion are not counted as verified coverage. No secrets were substituted.
- The CI jobs configured for Linux were adapted on macOS by isolating npm user configuration, using npm 11.6.2 and skipping Detox's macOS framework installation. No hardware signing, real-funds broadcast, native E2E or release workflows were run in this follow-up.

## Docker CI follow-up (2026-10-28)

- Repeated fresh `npm ci` and all three `ci.yml` jobs in official `node:24-bookworm`, pinned to image digest `sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a`. The container ran Linux ARM64, Node 24.22.1 and npm 11.19.1, with no host dependencies, npm configuration or credentials mounted.
- Standard dependency installation succeeded without the macOS adaptations. Lint/TypeScript passed with the same three existing warnings; units reported 600 passed and 1 skipped (65 suites), including all 52 Coinbase/Coin Control regressions. Integration reported 102 passed, 1 failed and 26 skipped; only the same multisig `108880` versus `0` assertion failed.
- The App mock adjustment passed in the full integration run. Missing-secret early returns, the unavailable Exir assertion and a Jest worker teardown warning remain coverage/validation limitations. This run does not reproduce the hosted runner's x86_64 architecture or execute native E2E/release jobs, and it does not change GitHub account restrictions.

The remaining stale multisig current-balance assertion was subsequently repaired in [TASK-012](TASK-012.md). Its complete Docker rerun passed all three CI jobs (601 unit tests and 103 integration tests passed), with the documented skip/coverage limitations retained.
