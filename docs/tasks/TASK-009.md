# TASK-009: Public version 1.1.0

Status: Complete

Requirement: REQ-008

## Scope

- Align Android, all Apple app/extension configurations, and root npm package/lockfile metadata to `1.1.0`.
- Build and install the full Android app in the existing local emulator.

## Verification

- Before editing, the version-consistency assertion failed: Android reported `1.0.0`; all six Apple configurations and npm metadata reported `8.0.2`.
- The same version-consistency assertion passes for Android, all six Apple configurations, and all root npm version entries.
- `plutil -lint ios/BlueWallet.xcodeproj/project.pbxproj` and `git diff --check` passed.
- The ARM64 Android Release test build succeeded. APK signature verification and 16 KiB zip alignment passed; package metadata reports `1.1.0`.
- The full-wallet APK excludes the isolated demo transaction stub, installed successfully over the existing simulator app, and launched successfully. Installed package metadata confirms `1.1.0`.
- Apple version metadata was validated; an iOS/macOS binary was not rebuilt for this update.
