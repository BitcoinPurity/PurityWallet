# TASK-009: Label immature Coinbase outputs in Coin Control

Status: Complete

## Scope

- Add the localized Immature badge using the existing Badge component and Coin Control layout.
- Reuse the central spendability policy through diagnostic reasons, without duplicating the 100-confirmation rule.
- Distinguish verified immaturity from unknown Coinbase status or unavailable/invalid chain-height verification.
- Preserve frozen/change badges, selection behavior and the existing transaction-construction guard.
- Synchronize English, Simplified Chinese, Traditional Chinese and their vocabulary entries.

## Verification

Screen-level regression tests cover 99/100/101 confirmations, ordinary/unconfirmed/unknown outputs, stale/missing/invalid heights, coexisting badges, localization, maturity and rollback after re-render. The initial test run reproduced three missing-badge failures against the unchanged screen.

- Focused screen/spendability/Electrum regression run: 45 passed.
- Full unit run: 63 suites passed; Jest reports 593 passed and 1 skipped, including all 11 new screen cases. Existing mnemonic-gated cases still return early without their environment variables.
- `tsc --noEmit`: passed.
- `npm run lint`: passed with the same three existing Prettier warnings in untouched files.
- `git diff --check`: passed.
- Native visual/device tests and live network integration were not rerun for this UI-only change; the existing spendability regression suites passed with the shared diagnostic calculation.
