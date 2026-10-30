# Branding architecture

PurityWallet separates its public brand from inherited compatibility identifiers.

- Public name: `PurityWallet`
- Canonical GitHub repository: `https://github.com/PurityWallet/PurityWallet`
- Canonical artwork source: `img/puritywallet-logo.png`, a blue PurityWallet-specific derivative of the Bitcoin Purity mark
- Android application identity: `org.bitcoinpurity.puritywallet` (retained for existing APK upgrades)
- Apple main application identity: `au.com.bitcoininstitute.puritywallet`
- Apple extensions: `.Stickers` and `.MarketWidget`
- Apple App Group/preference namespace: `group.au.com.bitcoininstitute.puritywallet`
- Android preference namespace: `group.io.bluewallet.bluewallet` (retained for existing settings/widget/privacy data)
- Compatibility boundary: URL schemes, native target/module names, wallet formats and upstream dependency coordinates remain unchanged. Notification ownership is the service migration described below.

Android installation/native-code namespaces and its preference namespace remain compatible with published APKs. Shared JavaScript selects the existing Android namespace or the new Apple App Group; Kotlin and Swift consumers agree with their respective platform. Apple task/activity IDs and signing/export configuration follow the new Apple identity. Apple Bundle ID changes and the experimental renamed Android package create separate installations; the established Android package follows in-place updates.

The checked-in Android Firebase package selector is aligned with the new identity for local builds; the complete Firebase client metadata must be replaced with a Firebase-generated client for `org.bitcoinpurity.puritywallet` before production release. Apple distribution also requires registered app/extension IDs, the new App Group, and matching provisioning profiles.

All platform, splash, in-app, and store icon derivatives are generated from the 1024 px PurityWallet master. iOS and store derivatives use opaque output where required; in-app, splash, and Android assets preserve transparency.

## Network defaults

JavaScript, iOS widget, and Android widget/client default-peer declarations share one logical Purity endpoint: `electrum.bitcoinpurity.org:50002` over TLS. The predefined explorer catalog contains the Purity mempool explorer plus the existing custom-URL entry.

## Notification service

The client notification base URL is `https://notifications.bitcoinpurity.org`. The node1 deployment must retain the Ground Control API contract, observe the Purity node, and send iOS notifications with the PurityWallet APNs topic. Deployment configuration belongs to this repository; upstream backend source must remain unmodified. The optional Ark payment-push integration has no active endpoint until BitcoinPurity deploys its equivalent. Backend and APNs verification precede the iOS release.

Remote push is enabled only on iOS for this release. Android remote registration and its settings entry are disabled; the gateway rejects Android identities. The project-owned startup adapter skips unused Google authentication in iOS-only sender mode, uses a 120-second HTTP timeout for local RPC batches, and bounds retention by the pinned mempool cache's dormant Map iterator. Upstream files remain unchanged.

Notification privacy copy lives in the existing `settings.push_notifications_explanation` localization key. English, Simplified Chinese, and Traditional Chinese describe the verified server retention; other locales omit this key and inherit English through the existing localization fallback. No notification protocol or backend behavior changes are needed for this correction.

The source configuration targets APNs topic `au.com.bitcoininstitute.puritywallet`. Prior TestFlight and delivery verification used `org.bitcoinpurity.puritywallet`; the new Apple record, matching profiles/credentials, and actual-device delivery still require verification. No deployed backend or Apple account configuration is changed by this integration.

## Donation flow

The Settings Donate action routes through the existing on-chain wallet selector and `SendDetailsRoot`. A single `PURITY_WALLET_DONATION_ADDRESS` parameter supplies the recipient. The standard Send flow retains address validation, amount entry, review, signing, and broadcast responsibilities.

## Feature visibility

Temporary product availability is controlled by `isLightningUiEnabled`. When disabled, wallet creation and Network settings omit Lightning entry points while Lightning wallet classes, routes, and persisted data remain unchanged.

## Public version

Version `1.1.0` is declared in Android `versionName`, each Apple target's `MARKETING_VERSION`, and the root npm package/lockfile metadata. The About screen reads the native app version through `react-native-device-info`.

Android public updates must retain the published app-signing identity. The public 1.0.0 signing certificate differs from the local test certificate; an unsigned release candidate and local test-signed upgrade are distinct artifacts. `versionCode` is 2 for the local 1.1.0 update, and CI overrides must exceed prior distributed codes.

The prior iOS/TestFlight 1.0.0 (2) artifact uses `org.bitcoinpurity.puritywallet`. The new Apple ID is a separate app-record boundary and requires corresponding signing, App Group, and APNs setup before distribution; existing external Apple/push assets were not migrated by this source change.

The original public release keystore has been recovered and its certificate matched against the public 1.0.0 APK. The signed 1.1.0/code-2 ARM64 artifact passed an independent in-place upgrade from that public APK. The universal release uses the existing four-ABI Gradle configuration (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) and the same package, data namespace, and release signing identity.

The original-key-signed universal APK has been built and verified: 25 matching native library names per ABI, valid ELF architecture, and 16 KiB APK alignment. An in-place update from public 1.0.0 passed on an isolated Android 36 ARM64 emulator, retaining package UID/data directory/first-install time. The other three ABIs have static coverage checks; runtime tests were limited to ARM64.
