# TASK-015: Align E2E with Purity feature flags and hardware fixtures

Status: Implemented; local verification complete, hosted E2E pending

## Evidence and scope

- `gh pr view 2` confirmed branch `fix/coinbase-maturity`, head `1c47bb798`. `gh run view 40632240428 --job 122634454850 --log-failed`, run annotations and downloaded failure artifacts were inspected before edits.
- Startup preflight succeeded; selftest and both other suites passed. Repeated creation/entropy failures wait for hidden `ActivateBitcoinButton`; vault creation also waits for hidden `ActivateVaultButton`. Screenshots show the rendered default Add Wallet screen without type buttons.
- The multisig case imported a historical Bitcoin wallet but connected to `electrum.bitcoinpurity.org`; Next remained disabled and the later signature-screen assertion timed out. The fixture's Bitcoin UTXOs cannot supply Purity spending funds.
- A first-attempt `AssetManager.finalize()` watchdog crash was also recorded; the settings case passed on retry. No crash/dialog suppression or retry change is introduced.
- The user explicitly selected production feature gating, rather than enabling upstream features in special E2E builds. Three hidden vault cases now skip with the feature disabled; on-chain creation/entropy/scanning, multisig import and Send/Coin Control remain active. Historical hardware signature verification moves to an offline fixture test; funded Purity multisig cosign UI remains unverified.

## Verification

- RED: the default-wallet helper regression failed at `ActivateBitcoinButton` before removing the obsolete clicks. GREEN: creation completes without any picker view.
- Test registration checks cover both feature-flag values. Offline hardware fixture validation checks zero/one/two signatures, verifies signatures cryptographically and finalizes the expected transaction.
- Native full E2E execution is a separate hosted validation after push; local checks do not claim that the hosted API 36 suite has passed.

- A clean official Node 24 Linux ARM64 Docker container completed `npm ci`, full `npm run lint` (including TypeScript) and all unit suites: 67 suites passed, 605 tests passed, 1 existing test skipped. Missing mnemonic secrets continue to limit some legacy test bodies.
- Final changed-file ESLint, host TypeScript and `git diff --check` passed. The targeted four-suite run passed all 6 tests, including both flag configurations. No full native E2E or live integration suite was rerun locally for this test-only change.
