# Migration report

## Preserve the established Android upgrade path

Supersede the Android portion of the identity unification: retain `org.bitcoinpurity.puritywallet` and `group.io.bluewallet.bluewallet`, restoring native/codegen/store/install configuration and existing preferences. Shared currency/privacy JavaScript selects the original Android preference group and the new Apple group per platform. Apple identifiers remain under `au.com.bitcoininstitute.puritywallet`. Increase the Android local version code to 2 and allow the release script to replace any numeric base code.

The published GitHub 1.0.0 APK was downloaded and checked against its SHA256SUMS: package `org.bitcoinpurity.puritywallet`, version code 1. Its signing certificate differs from the local temporary test key. The recovered original release key signed both the initial ARM64 artifact and the final four-ABI universal 1.1.0/code-2 APK. The universal APK retains all 100 original native-library paths, passes ELF architecture, signature, checksum, and 16 KiB APK alignment checks, and preserves minimum/target SDK, required features, and permissions. An independent Android 36 ARM64 emulator accepted an in-place upgrade from public 1.0.0 while retaining app UID/data directory/first-install time; launch succeeded without observed runtime errors. The other three ABIs were checked statically, not runtime-tested. Local test signing remains separate from the public signature. No data migration, uninstall, or data clear was used, and the user's existing emulator was untouched. Historical sections below describe earlier stages.

## Unified application identity

Supersede the initial Android `org.bitcoinpurity.puritywallet` and inherited Apple `io.bluewallet.bluewallet` IDs with `au.com.bitcoininstitute.puritywallet`. Apple extension IDs retain `.Stickers` and `.MarketWidget`. App Group entitlements and JavaScript/Swift/Kotlin preference clients move together to `group.au.com.bitcoininstitute.puritywallet`; activity/task IDs, codegen/native packages, store links, and build/export/install configuration are aligned. Native target/module names, URL schemes, wallet formats, and GitHub ownership are retained.

This installs a separate application; prior apps and data are retained, with explicit backup/import required for wallet recovery. No data or credential migration is implemented. Firebase client configuration and Apple registered IDs/App Group/provisioning profiles must be generated for the new identity before production distribution. Earlier migration entries below describe the prior stages.

## GitHub organization migration

Use `PurityWallet/PurityWallet` for the canonical repository, app About link, npm repository metadata, README repository badges/checkout instructions, and the local origin remote. Preserve historical upstream issue/PR references and native application identities.

## Version 1.1.0

Align Android version `1.0.0` and inherited Apple/npm version `8.0.2` to the PurityWallet public version `1.1.0`. Preserve build-number configuration, application identities, and wallet storage; no data migration is required.

## Replay-warning localization coverage

Extend the seven replay-check messages from English and simplified/traditional Chinese to all 71 supported app locales. Retain the existing keys and language loaders, and add coverage checks that read each loaded dictionary before fallback. Locale vocabularies record replay-risk terminology; the signing and failed-check acknowledgement behavior is unchanged.

## Legacy Bitcoin chain replay warnings

Add a read-only mempool.space mainnet check without migrating wallet data or changing Purity Electrum/broadcast configuration. Coin Control labels shared UTXOs, including frozen outputs. Send warns for shared selected inputs and repeats the check for actual coin-selected inputs before signing. Both all-shared transactions and unknown checks require explicit risk acknowledgement; cancellation stops signing. Failed checks explain the uncertainty and allow an informed user to proceed. English and simplified/traditional Chinese copy cover checking, failure, replay risk, and acknowledgement. Existing signing and transaction review continue after the gate succeeds. API availability and accuracy bound this online warning; it is not protocol-level replay protection.

## BlueWallet to PurityWallet visible brand

This migration updates presentation, distribution metadata, and artwork. iOS/macOS internal projects, targets, modules, identifiers, schemes, storage namespaces, endpoints, and dependency references remain compatible. Android is intentionally published as the separate application `org.bitcoinpurity.puritywallet` so it can coexist with BlueWallet.

The Android package split creates a new application data directory and does not automatically migrate an existing BlueWallet installation. Users must restore through the wallet backup/import flow. Android native code packages, codegen metadata, package-dependent scripts, and the Firebase package selector are aligned with the new identity; the complete Firebase client file still needs to be regenerated for this package before production. Shared preference key strings remain unchanged for JavaScript/native interoperability.

The wallet artwork now uses a blue colorway of the Bitcoin Purity mark. The geometry and silver faceted center are retained, while the gold accents are replaced with cobalt/electric blue to distinguish PurityWallet from the gold Purity Node identity.

The About screen now links to the PurityWallet repository and the official Bitcoin Purity X account. The obsolete BlueWallet Telegram entry was removed because no corresponding Bitcoin Purity Telegram channel is published.

## Purity service defaults

Bundled Electrum peer lists are consolidated to the Bitcoin Purity TLS endpoint across JavaScript and native widget clients. The predefined block-explorer catalog is consolidated to the Bitcoin Purity mempool explorer. Persisted custom-service keys and parsing behavior are retained.

## In-wallet donation handoff

The Settings Donate action is migrated from the legacy `https://donate.bluewallet.io/` browser link to the existing on-chain Send flow. The recipient is centralized in one replaceable parameter. The initial value is deliberately invalid until the official PurityWallet developer address is supplied, preventing accidental payment to an arbitrary valid address.

## Temporary Lightning UI gate

Lightning and Ark creation choices and the Lightning Network settings row are hidden behind a disabled feature flag. No Lightning implementation or persisted data is removed, allowing the feature to be restored later without a wallet-data migration.

## Standard Bitcoin wallet creation

New-wallet creation no longer exposes a wallet-type choice. A disabled presentation flag leaves the upstream selection state, constructors, route parameters, and multisig screens intact; the unchanged default creates a native SegWit (`p2wpkh/HD`) Bitcoin wallet. Existing persisted wallets and import formats are not migrated or removed.

## Existing Apple release artifact verification

Inspection of the prior `PurityWallet-1.0.0-2.ipa` confirms Bundle ID `org.bitcoinpurity.puritywallet`. The selected new Apple Bundle ID cannot update that previously uploaded TestFlight record. Continuing under the new ID requires a new App Store Connect app record and matching signing/App Group/APNs setup, independently of Individual-to-Organization membership conversion. No external Apple records or notification-service configuration were changed.
