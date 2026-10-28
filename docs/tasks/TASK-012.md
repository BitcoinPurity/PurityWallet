# TASK-012: Repair multisig CI balance validation

Status: Complete

## Scope

- Replace the stale public-wallet current-balance constant with transaction-history reconciliation while retaining the immutable 108880-sat funding assertion.
- Verify funded-to-empty balance refresh deterministically using existing public cosigners and mocked Electrum responses.
- Include the previously identified App Electrum mock repair, run the complete `ci.yml` jobs in Docker, then commit and push after successful validation.
- Preserve production wallet behavior, secrets-dependent coverage boundaries and separate native E2E/release validation.

## Verification

The unchanged online test failed with 108880 expected and 0 returned. Live transaction inspection identified the later -108880-sat confirmed spend, and all eight transaction values sum to zero. The new deterministic funded-to-empty unit case passed while the old online assertion still failed. After repairing the online assertion, both focused suites passed (16 tests).

- A fresh official Node 24 Linux ARM64 container ran standard `npm ci`, followed by all three `ci.yml` jobs. The pinned image digest is `sha256:6449e19d8184d84062525b6a7524def03146c2cb04a7f08b076680d0e8e4240a`; Node 24.22.1 and npm 11.19.1 were used without host dependencies or credentials.
- Lint/TypeScript passed with the same three existing Prettier warnings. The changed test files also passed ESLint without warnings.
- Units: 65 suites passed; 601 tests passed and 1 skipped. All 52 Coinbase/Coin Control regressions passed.
- Complete integration: 13 suites passed and 2 skipped; 103 tests passed and 26 skipped, with no failures. The multisig fixture and App SelfTest both passed.
- Missing mnemonic secrets still cause additional legacy test bodies to return early despite Jest counting them as passed; the Exir assertion was unavailable, and Jest reported a worker teardown warning. These coverage limits were retained rather than suppressed. Native E2E/release jobs and hardware signing were not run.
- `git diff --check` passed. Production balance/derivation/signing code, dependencies and CI assertions for immutable transaction data remain intact.
