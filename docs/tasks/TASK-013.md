# TASK-013: Repair native release CI triggers and Android SDK setup

Status: Complete

## Evidence and scope

- `gh` resolved PR #2 to `fix/coinbase-maturity` at `399fbab24` and retrieved the latest runs, annotations and failed-job logs before changes.
- Android job `122603081893` in run `40623571229` fails on `sdkmanager tools`: `Failed to find package 'tools'`. The pinned setup action declares `tools platform-tools` as its default. Override it with `platform-tools` while keeping explicit platform/build-tools/NDK installation.
- iOS job `122603082001` in run `40623571195` fails in provisioning: `GIT_ACCESS_TOKEN environment variable is missing`. Repository secrets are absent. The user explicitly chose signed iOS and Android releases only on `master` pushes/manual dispatch, retaining existing PR native E2E build checks.
- No production signing credentials, application behavior, E2E workflows or dependencies are changed. Signed production builds still require real secrets.

## Verification

A pre-change YAML policy probe failed the three release-trigger/SDK requirements while confirming existing PR iOS/Android E2E and lint/unit/integration triggers. All six checks passed after the repair.

- Both modified workflows passed Docker `actionlint` syntax, expression and action-input validation. ShellCheck/Pyflakes were disabled because no embedded shell/Python scripts changed. The tool image was pinned to `sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`.
- The pinned setup action's own `action.yml` confirms the configurable `packages` input and removed legacy default. No action dependency or application code changed.
- `gh` confirmed lint, unit and integration jobs and the Android native E2E build succeeded on the starting PR head; the native E2E workflows remain unchanged. New-head online results are checked after push rather than assumed from the previous commit.
- `git diff --check` passed. Signed production builds and SDK installation on a fresh hosted runner were not run locally; publishing secrets remain required for actual releases. Runtime tests were not repeated for this workflow/documentation-only patch.
