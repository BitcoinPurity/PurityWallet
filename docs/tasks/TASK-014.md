# TASK-014: Clear Android boot dialogs before E2E launch

Status: Complete

## Evidence and scope

- `gh` resolved PR #2 to `1f10cbbfd` and retrieved run `40625679228`, job `122613020229`, annotations, logs and the `e2e-android-videos` artifact before edits. Native compilation succeeded; all 14 UI tests failed across retries.
- The first self-test failure screenshot shows `System UI isn't responding` over the rendered wallet home screen. Its device log records `ANR in com.android.systemui` / `failed to complete startup` at 03:29:51 UTC, before Detox starts at 03:29:56 UTC. The app-window focus errors are downstream of this boot dialog.
- Add a bounded wait for boot broadcast idle and one `CLOSE_SYSTEM_DIALOGS` broadcast before Detox. Keep API 36, test coverage, synchronization, retries and failure artifacts unchanged; do not alter the wallet or persistently suppress dialogs.

## Verification

The pre-change workflow probe failed both startup-order requirements while confirming API 36, full-suite/artifact flags and absence of persistent dialog suppression. All five checks passed after the patch.

- The modified workflow passed Docker `actionlint`; its extracted preflight/test script passed ShellCheck and `bash -n`. `git diff --check` passed.
- A new isolated API 36 ARM64 emulator ran `am wait-for-broadcast-idle` successfully in 4.28 seconds and `CLOSE_SYSTEM_DIALOGS` in 0.25 seconds. `dumpsys window` confirmed the launcher held focus afterward. A 120-second subprocess timeout bounded the native wait during local verification. The temporary emulator was stopped afterward.
- Android 16's `BaseErrorDialog` receiver handles `CLOSE_SYSTEM_DIALOGS`; `AppNotRespondingDialog.closeDialog()` closes the failed process. The one-time broadcast is therefore restricted to the pre-Detox stage, before the wallet is installed/launched, rather than repeated during tests.
- The hosted Linux x86_64 cold-boot ANR and full E2E suite were not reproduced locally; the local image is Google APIs Play Store ARM64. New-head online E2E validation is checked after push. No wallet runtime tests were repeated for this CI-only patch.
