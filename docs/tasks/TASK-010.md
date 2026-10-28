# TASK-010: Move Send Coin Control from menu to button

Status: Complete

## Scope

- Remove Coin Control from the Send ellipsis action list and dispatcher.
- Add a localized secondary button below fees and above Next using the existing button component and theme.
- Preserve the selected-wallet callback, processing-state protection, selected-coins summary and frozen-balance shortcut.
- Keep zero-balance wallet access and existing selection/spendability behavior.

## Verification

Screen regressions cover the visible button and navigation, absence from the menu with other actions retained, initial preselected coins and wallet switching. The unchanged screen reproduced four failures: three missing-button cases and a retained-menu-action assertion.

- Focused Send/Coin Control/header regression run: 17 passed.
- Final button regression run: all 4 passed after flushing asynchronous screen updates with `act`; no act warnings remain in this run.
- Full unit run: 64 suites passed; Jest reports 597 passed and 1 skipped. Existing mnemonic-gated cases still return early without their environment variables.
- TypeScript: passed.
- Repository lint: passed with three existing Prettier warnings in untouched files. Changed-file ESLint: clean.
- `git diff --check`: passed.
- Native visual/device tests and live network integration were not run for this entry-point presentation change.
