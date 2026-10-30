# TASK-021: Use an independent iOS application identity

Status: Historical release record; current Apple identity superseded by TASK-019 / REQ-016

Requirement: REQ-016 (current identity); prior local iOS identity record.

Renumbered from the local TASK-008 to preserve the remote Coinbase task. All identifiers, signing results, TestFlight builds, and delivery evidence below describe the October 25 release under `org.bitcoinpurity.puritywallet`. They do not validate the current `au.com.bitcoininstitute.puritywallet` identity. Current Apple identifiers follow TASK-019; current notification setup follows TASK-022 / REQ-018.

## Scope

- Use `org.bitcoinpurity.puritywallet` for the iOS app and matching identifiers for the Stickers and MarketWidget extensions.
- Move iOS shared defaults and widget communication to `group.org.bitcoinpurity.puritywallet`; keep Android's preference name unchanged.
- Keep Debug automatic signing; use named App Store profiles and the Apple Distribution identity for iPhoneOS Release builds on the PurityWallet team.
- Document that existing BlueWallet data must be restored through wallet backup/import.

## Verification

- Inspect Release build settings and the exported archive for the new bundle IDs and app group.
- Complete App Store Connect setup, upload, metadata, and review submission after account and listing requirements are available.

## Release prerequisites observed October 25, 2026

- Current Developer membership is enrolled as Individual; the user will contact Apple to convert it to an organization. Apple's App Review Guideline 3.1.5(i) requires cryptocurrency wallets to be offered by organization members. Resolve the enrollment requirement with Apple or use an eligible organization team before formal submission: https://developer.apple.com/app-store/review/guidelines/#cryptocurrencies.
- The user downloaded the Widget and Stickers profiles after Chrome blocked automated download. All three App Store profiles are now validated and installed, with SDK-specific manual distribution signing for iPhoneOS Release.
- The latest signed build must include the BitcoinPurity notification endpoint and retain the production push entitlement and app group. Actual-device notification delivery passed with TestFlight build `1.0.0 (1)`; organization enrollment and remaining release follow-ups still precede App Review.

## Latest build

- Signed archive and export of version `1.0.0 (1)` succeeded with all three named distribution profiles. Final IPA signatures, Bundle IDs, production push entitlement, app group, and bundled BitcoinPurity notification URL passed inspection.
- Local artifact: `build/ios/PurityWallet-1.0.0-1.ipa`; SHA-256: `2c6fc9129369fb56c3f3d7246de7a5736b40bbed5d9e4adb5ac8d21e504653a4`. Xcode reports App Store Connect upload succeeded and the package entered processing; this is not a formal App Review submission.

- Upload completed with missing-dSYM warnings for the vendor-prebuilt `React.framework`, `ReactNativeDependencies.framework`, and `hermesvm.framework`. This does not block package upload, but limits symbolication of crashes in those frameworks; matching dSYMs were not present in the local Pods, build, or archive.

- App Store Connect processed `1.0.0 (1)` and lists the build as Ready to Submit. Internal group `PurityWallet Internal` was created with automatic distribution disabled; the processed build has been added to the group. The user authorized inviting the current ASC account. That account was added on October 25, 2026; ASC shows Invited. A refreshed group shows 1 Tester and 1 Build, with build `1.0.0 (1)` in Testing state. Real-device installation and APNs receipt were subsequently verified: the backend recorded Apple HTTP 200 and the user confirmed the iPhone received the test notification.

- Build `1.0.0 (1)` finished Apple processing, was associated with the `PurityWallet Internal` group, and was selected/saved on App Store version `1.0`. The version remains Prepare for Submission; no App Review submission was made.

## Notification privacy follow-up

- Build `1.0.0 (2)` corrects the notification disclosure in English and both Chinese variants, using the existing English fallback for other languages. Archive, export, final IPA signatures, build numbers, push/app-group entitlements, and all three embedded notices passed inspection.
- Artifact: `build/ios/PurityWallet-1.0.0-2.ipa`; SHA-256: `ed959f2f20685deea459ccbb1f99ec1f3798c1a15729b6f2f010485f569f5444`. Upload and Apple processing completed; build `1.0.0 (2)` is Testing in the existing internal group. Use this corrected build instead of build 1 when formal App Review resumes after organization enrollment.
