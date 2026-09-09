# TASK-001: Rebrand visible product identity to PurityWallet

Status: Complete

## Scope

- Update user-visible product names to `PurityWallet`.
- Replace application and splash artwork with the Bitcoin Purity icon.
- Preserve iOS/macOS compatibility identifiers and upstream references; Android identity is defined by TASK-006.

## Verification

- All 71 localization JSON files parse and contain no old visible brand references.
- Fastlane metadata validation, localization checks, XML/plist checks, and `git diff --check` pass.
- The canonical logo matches the Bitcoin Purity source checksum; generated platform dimensions and iOS opaque icon output are verified.
- A branding regression test was added. Jest execution requires installing the repository dependencies, which are absent in the current checkout.
