# Migration report

## Unsigned Android and iOS CI builds

REQ-019 / TASK-023 supersedes CI release-signing behavior in REQ-011 / TASK-013. Remove Android keystore/signing steps and Apple keychain/provisioning/export/TestFlight steps from the release workflows. Retain build-number progression and upload explicitly unsigned APK and compressed iOS archive artifacts. Existing identities, wallet data, local/manual signed-release tools, PR validation, and production signing/upgrade requirements remain unchanged. No service deployment or app-store change is performed.

Six workflow regression cases failed before implementation and passed afterward, exercising the actual YAML scripts with stubbed native builders and no signing credentials. Both workflows passed actionlint, all 20 embedded shell scripts passed syntax checks, and full lint passed with three existing unrelated formatting warnings. Actual hosted native builds and installation/distribution remain unverified by these local checks.

## October 30 local and remote integration

Fast-forward master to origin/master and retain the local notification service, iOS-only client registration, privacy disclosures, privacy manifest, SceneDelegate startup, and build preparation. Keep the remote Apple Bundle IDs/App Group, public version 1.1.0, replay checks, and Coinbase spendability changes. Keep the Android package and preference namespace unchanged.

Remote TASK-008/TASK-009 and REQ-007/REQ-008 retain their Coinbase meanings. The previous local iOS release record is archived as TASK-021, superseded for current identity by TASK-019/REQ-016. Local notification work becomes TASK-022/REQ-018. Existing deployment and TestFlight evidence remains historical; this merge performs no external deployment or Apple configuration changes. Integration verification passed 289 focused Jest tests, 12 backend tests (including the pinned-upstream cache regression), and 4 host-configuration tests. Full lint/TypeScript and Apple/Ruby syntax checks passed; lint retains three unrelated formatting warnings. See TASK-022 for coverage and release limits.

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

## Coinbase spendability repair

Previously UTXOs from listunspent (and locally reconstructed replacement inputs) reached coinselect without Coinbase checks. The fix adds optional classification metadata, a shared spendability policy and asynchronous cached classification. No wallet reimport, seed conversion, server changes or consensus changes are needed. Old unknown UTXOs remain visible and become spendable after successful normal synchronization.

Fresh actual headers and listunspent/history heights replace estimated confirmations only for Coinbase eligibility. Height verification is invalidated on header identity changes and reconnects, preventing persisted or reorganized heights from remaining trusted. The total-balance display is retained; a dedicated immature-balance UI is deferred. See [UTXO spendability architecture](architecture/utxo-spendability.md).

## Coin Control immature-output label

Coin Control now distinguishes confirmed immature Coinbase outputs with a localized badge. The shared spendability calculation exposes diagnostic reasons so unknown verification is not confused with immaturity. This is a presentation change with no wallet-data migration, new network calls, balance-category changes or changes to selection/signing policy.

## Send Coin Control entry

The Send ellipsis action is replaced with a visible secondary Coin Control button above Next. The existing localized title, navigation callback and loading protection are reused. No persisted-state, route or transaction-policy migration is required.

## Immature-only Coin Control access

Live emulator inspection found that the Wallet Details Coins entry counted spendable outputs and became inaccessible for immature-only wallets. Its count now uses all owned UTXOs, restoring entry access without changing spending eligibility or stored data.

## Multisig CI balance fixture

The public multisig fixture spent its remaining 108880 sats, so its old fixed current-balance expectation is stale. The integration test now retains immutable funding assertions and reconciles live balance with transaction history; an offline funded-to-empty refresh test preserves positive-balance coverage. No runtime behavior, dependency or data migration is required. See [wallet balance validation](architecture/testing.md).

## Native release workflow repair

PR #2 exposed the pinned Android SDK action's removed `tools` default and an iOS signed build requiring absent publishing secrets. Both signed-release workflows now run only on `master` pushes or manual dispatch, as requested; existing PR native E2E builds remain enabled. Android setup explicitly requests `platform-tools`. Production releases still require their real configured secrets and have not been validated by this scheduling change. No application or wallet-data migration is required.

## Android E2E boot focus

Run `40625679228` built successfully but failed UI tests because a SystemUI startup ANR, recorded before the wallet launch, held window focus. Its first failure screenshot shows the wallet home screen behind the system error dialog. The workflow now drains boot broadcasts and closes stale system dialogs once before Detox starts. API level, tests, retries, reporting and application behavior remain unchanged; there is no wallet-data migration.

## E2E compatibility with Purity features

The UI tests now use the existing default wallet type and obey the disabled wallet-type/Lightning flags. Per the user's explicit choice, three vault-creation cases are skipped until that UI is enabled. Historical Bitcoin multisig signatures move to offline cryptographic validation; native UR import and Send/Coin Control remain exercised on Purity. No application or wallet-data migration is needed. Funded Purity multisig cosign-screen E2E coverage remains a limitation.

## BitcoinPurity notification ownership (historical deployment)

The iOS release depends on a compatible notification backend on node1 at `notifications.bitcoinpurity.org`. Client registration moves from Ground Control's BlueWallet host to this BitcoinPurity endpoint. The optional Ark push endpoint stays empty while no BitcoinPurity equivalent is deployed. Existing subscription payload formats remain compatible; backend source is consumed without modifying the upstream dependency. APNs credentials, chain selection, HTTPS, provider responses, and the public privacy policy must be verified before rebuilding the release archive. Actual-device delivery is verified with that signed build before App Review submission.

The backend now runs on node1 with verified HTTPS, renewal, API contracts, Purity RPC observation, and a topic-specific production APNs key. A synthetic push received Apple's expected `BadDeviceToken` response; the subsequent genuine-device test received Apple HTTP 200 and the user confirmed iPhone receipt. Android remote push is temporarily disabled by user decision while BitcoinPurity FCM credentials are unavailable. The public privacy policy has been updated to reflect the service and retention configuration.

The notification privacy notice no longer promises automatic deletion when delivery is disabled or the wallet is uninstalled. It follows the verified retention policy, with complete English and Chinese copy and existing English fallback for other locales. This disclosure correction is available in TestFlight as iOS `1.0.0 (2)`; it does not alter the notification protocol or wallet data.

The deployment and TestFlight results above concern APNs topic `org.bitcoinpurity.puritywallet`. During the October 30 source integration, Apple identifiers remain those selected by origin/master (`au.com.bitcoininstitute.puritywallet`), and the notification startup validation/example now require that matching topic. New topic credentials, provisioning profiles, app records, and actual-device delivery have not been deployed or verified by this integration.
