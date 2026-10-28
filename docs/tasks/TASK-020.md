# TASK-020: Preserve Android APK upgrades

Status: Complete (original-key-signed four-ABI universal APK; public 1.0.0 upgrade verified on ARM64)

Requirement: REQ-017 (clarifies REQ-005 and REQ-016)

## Scope

- Retain Android package/native namespace `org.bitcoinpurity.puritywallet`, preference namespace `group.io.bluewallet.bluewallet`, and existing wallet data.
- Retain Apple identifiers under `au.com.bitcoininstitute.puritywallet` and choose the shared preference group per platform.
- Use Android local `versionCode` 2 and keep release-number overrides working.
- Prepare a 1.1.0 release candidate and verify local in-place updating without uninstalling/clearing the original app.
- Public distribution requires the original released app-signing key, independent of the local temporary test key.
- Build and sign a universal release APK containing `armeabi-v7a`, `arm64-v8a`, `x86`, and `x86_64`, matching public 1.0.0 architecture coverage.

## Verification

- Before implementation, the package identity check failed and a seeded existing Android AUD currency preference was incorrectly read as the default USD. Apple namespace behavior remained valid.
- After implementation, both identity/currency suites passed all 10 tests, including reading existing preferences on both platforms.
- GitHub release `1.0.0` contains `PurityWallet-1.0.0.apk`; its published SHA256SUMS matches the downloaded APK.
- That public APK has package `org.bitcoinpurity.puritywallet`, version name `1.0.0`, and version code `1`. Its signing certificate does not match the local temporary test certificate. The release key/configuration must be located before producing a public signed upgrade.
- Six focused Jest suites passed all 39 tests, including both platform preference namespaces, settings behavior, replay acknowledgement, and signing gates.
- `npm run lint` passed with three existing unrelated formatting warnings; `git diff --check` and release-script shell syntax passed.
- The unsigned ARM64 Release candidate built successfully at version `1.1.0` / version code `2`. The release-script code override was exercised against a version-code-2 input and successfully produced code 23.
- A separate local-test-signed copy matches the previously installed local test certificate and differs from the public 1.0.0 certificate. Its in-place emulator update succeeded without uninstall/clear; app UID, data directory, and first-install time remained unchanged. Startup succeeded without AndroidRuntime/ReactNativeJS error logs.
- The original release keystore was located and unlocked by the owner in a local hidden password prompt. Its certificate exactly matches the published 1.0.0 APK. The 1.1.0 code-2 ARM64 artifact was signed with that key, then independently passed signature, checksum, package/version, and 16 KiB alignment checks.

## Original signing flow

- `.github/workflows/build-release-apk.yml` invokes `fastlane android build_release_apk` with `KEYSTORE_FILE_HEX` and `KEYSTORE_PASSWORD` from Actions secrets.
- `fastlane/Fastfile` reconstructs `android/bluewallet-release-key.keystore`, signs the APK, then deletes the temporary keystore file. The private key is not embedded in the source repository or recoverable from the public APK.
- The current repository-level secret-name listing is empty; organization-level secret metadata could not be checked with the available permissions (HTTP 403). This does not establish whether the original key is lost or exists in an organization-level configuration/backup.

## Apple record boundary

- The recorded prior TestFlight build is `1.0.0 (2)`; inspecting its existing IPA confirms Bundle ID `org.bitcoinpurity.puritywallet`.
- The currently selected Apple ID `au.com.bitcoininstitute.puritywallet` therefore requires a new App Store Connect record and matching capabilities/signing/push configuration if used for distribution. It cannot update the existing app record. No new Apple app record or external signing/push configuration was created by this task.

## Release-key recovery progress

- Located a separate persistent PKCS12 release-keystore candidate outside the repository. Its creation time is 2026-09-10 20:20 Australia/Melbourne, shortly before the public APK asset was uploaded that evening.
- The candidate is password-protected. Its certificate cannot be read without the correct password; the current local-test credential does not unlock it. Its correspondence to the published signing certificate remains unverified.
- The existing user Gradle configuration points to a different internal-test keystore, whose readable certificate does not match the public APK.
- Source/project files, the relevant signing workflow, local signing configuration, accessible keychain metadata, and relevant local history were inspected without printing secret values. No original release credential was recovered from those sources.
- Resolved: the owner entered the original password locally. The candidate certificate matched the public APK and the original private key successfully signed the upgrade. No replacement signing identity was created, and the temporary password files were removed automatically.

## Public-signature upgrade result

- In an independent empty emulator, installed the publicly released 1.0.0 APK, launched it, and then installed the original-key-signed 1.1.0 code-2 APK with `adb install -r`.
- The update and launch succeeded. App UID, data directory, and first-install time were unchanged; no uninstall or data-clear operation was used, and AndroidRuntime/ReactNativeJS error logs contained no startup error.
- This verifies package/signature/version continuity. No funded wallet or real transaction signing/broadcast was involved.
- The initial signed artifact contains `arm64-v8a` only. The user subsequently requested a universal replacement matching public 1.0.0: `arm64-v8a`, `armeabi-v7a`, `x86`, and `x86_64`.

## Universal release follow-up

- Before building, the architecture-coverage check passes on public 1.0.0 and fails on the ARM64-only candidate, identifying the other three missing ABIs.
- Universal Release build succeeded with all four ABIs. Each ABI contains the same 25 native library names as public 1.0.0; ELF class/machine and 16 KiB APK alignment checks passed. Package/version are `org.bitcoinpurity.puritywallet`, `1.1.0` / code `2`.
- The isolated emulator has the public 1.0.0 APK installed and launched; its UID/data directory/first-install time were recorded before updating.
- The owner entered the original release password locally; the signed universal APK passed independent signature verification against public 1.0.0, checksum, and 16 KiB APK alignment checks. No password was retained.
- The universal APK's minimum/target SDK, required features, permissions, ABI list, and all 100 native-library paths match public 1.0.0. Each native library has the expected ELF class/machine for its ABI.
- Installed the signed universal APK with `adb install -r` over public 1.0.0 in the isolated Android 36 ARM64 emulator. Upgrade and launch passed; app UID, data directory, and first-install time were unchanged, the app process remained running, and no AndroidRuntime/ReactNativeJS startup errors were observed.
- ARMv7, x86, and x86_64 received archive/ELF/library checks; those architectures were not runtime-tested. No funded wallet or real transaction was used. The user's original emulator was untouched.
- Output: `artifacts/android/PurityWallet-1.1.0-build2-universal-release.apk` (86,205,247 bytes), with adjacent SHA256 and build/verification metadata. SHA256: `dfc7644345ae52de93cefdac22b66419bb91ec453f9d242bf18073f8d9aef87a`.
