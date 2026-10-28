# Product specification

## PurityWallet brand identity

The canonical repository belongs to the GitHub organization `PurityWallet`: `https://github.com/PurityWallet/PurityWallet`. App repository links, root npm repository metadata, checkout instructions, and the local origin remote use this location.

The product is presented to users as **PurityWallet** on iOS, Android, macOS Catalyst, launch surfaces, in-app localized copy, and app-store metadata. Its app, splash, and in-app brand artwork uses a PurityWallet-specific blue colorway of the Bitcoin Purity mark so it is visually distinct from the gold Purity Node identity.

Android retains application identity `org.bitcoinpurity.puritywallet` and preference namespace `group.io.bluewallet.bluewallet` for upgrades of already distributed APKs. iOS/macOS use `au.com.bitcoininstitute.puritywallet`; Apple extensions retain `.Stickers` and `.MarketWidget`, and Apple App Group/preference clients use `group.au.com.bitcoininstitute.puritywallet`. Shared JavaScript selects the preference namespace per platform. Native target/module names, URL schemes, wallet formats, service endpoints, and upstream dependency references retain their current values.

### Acceptance criteria

- Installed application labels display `PurityWallet`.
- User-facing localized strings no longer display `BlueWallet` or `Blue Wallet`.
- iOS, macOS Catalyst, Android, splash, in-app, and store icon assets derive from one 1024 px PurityWallet blue master icon.
- The mark geometry and silver/white faceted center remain recognizable while gold accents are replaced by a saturated cobalt/electric-blue palette.
- Android retains `org.bitcoinpurity.puritywallet` for application ID/code namespace; iOS/macOS main app Bundle IDs use `au.com.bitcoininstitute.puritywallet`.
- Apple extensions use `au.com.bitcoininstitute.puritywallet.Stickers` and `au.com.bitcoininstitute.puritywallet.MarketWidget`; Apple entitlements and preference clients use `group.au.com.bitcoininstitute.puritywallet`, while Android preference clients retain `group.io.bluewallet.bluewallet`. URL schemes, native module names, wallet formats, and network settings remain compatible.
- Android APK updates retain the original package, compatible app-signing identity, and data directory; build 1.1.0 uses local `versionCode` 2, with release automation required to exceed the highest previously distributed code. Apple builds with changed Bundle IDs/App Groups remain separate apps and require backup/import. The experimental Android app under `au.com.bitcoininstitute.puritywallet` remains separate and is not automatically migrated.

### Android application identity

PurityWallet retains the existing Android application ID `org.bitcoinpurity.puritywallet`. Package-dependent Android metadata and service configuration must use this identity. The checked-in Firebase package selector is aligned for local builds, but the complete Firebase Android client configuration must be generated for this package before production distribution. Apple distribution requires registered app/extension IDs, the matching App Group, and provisioning profiles for these new identifiers.

## Purity network defaults

Fresh installations and default/reset behavior use only the Bitcoin Purity services below:

- Electrum: TLS at `electrum.bitcoinpurity.org:50002`
- Block explorer: `https://mempool.bitcoinpurity.org`

No other bundled fallback Electrum peers or predefined block explorers are offered. Explicit user configuration remains supported and is not overwritten.

## PurityWallet donations

The Settings Donate action remains inside PurityWallet. It asks the user to choose a send-capable on-chain wallet, then opens the standard Send screen with the configured donation recipient prefilled. The amount remains empty and the normal transaction review and confirmation flow is unchanged.

The recipient is defined by one replaceable configuration parameter. While the official developer address is pending, that parameter must contain an intentionally invalid placeholder rather than a valid third-party Bitcoin address.

### Acceptance criteria

- Donate does not open `donate.bluewallet.io` or another external donation page.
- Only send-capable on-chain wallets are offered for selection.
- The selected wallet ID and configured recipient are passed to the standard Send screen.
- No amount is preset and no transaction is automatically created, signed, or broadcast.

## Lightning feature visibility

Lightning support is temporarily unavailable as a user-selectable feature. The Add Wallet interface does not show Lightning, LNDHub, or Ark wallet choices, and Network settings does not show Lightning settings.

This is a reversible presentation gate. The underlying implementation, navigation contracts, and persisted wallet formats remain intact. Existing persisted Lightning wallets are not deleted or rewritten.

### Acceptance criteria

- Add Wallet does not expose Lightning wallet creation.
- Advanced wallet-type menus do not expose Lightning wallet creation.
- Network settings does not expose Lightning settings.
- Network settings and wallet-type selection remain controlled by disabled presentation flags.

## Standard Bitcoin wallet creation

The Add Wallet flow asks only for the wallet name and optional entropy. Its wallet-type controls are hidden, so the existing default state produces a native SegWit (`p2wpkh/HD`) Bitcoin wallet and proceeds to the standard backup screen.

The existing type-selection state, route parameters, wallet constructors, multisig screens, and import formats remain in the source for upstream compatibility. This is a presentation-only change.

### Acceptance criteria

- The Add Wallet screen does not show Bitcoin, multisig Vault, Lightning, or Ark type buttons.
- The Add Wallet header menu does not offer alternative wallet types.
- Without an explicit internal route override, Create follows the existing index `0` / on-chain default and instantiates `HDSegwitBech32Wallet`.
- Existing alternative wallet constructors, route parameters, and multisig screens are retained.
- Import Wallet remains available.

## Legacy Bitcoin chain replay warnings

Coin Control checks all outputs against Bitcoin mainnet using the read-only mempool.space API. Each output that has the same `txid:vout`, value, and locking script and remains unspent carries a prominent replay-risk label. Pending and failed checks have distinct labels; a failed request does not imply an output is absent.

Send checks manually selected inputs as soon as they are selected and warns when all of them match. Before creating/signing a transaction, it checks the actual inputs selected for the recipient amount and fee, including automatic selection. If all actual inputs match, a non-dismissible confirmation explains that this transaction may be replayed on Bitcoin Core's chain and spend the corresponding BTC. If any input cannot be checked, the confirmation instead explains that replay risk cannot be determined and that the corresponding BTC may still be spent. In both cases, only explicit risk acknowledgement permits signing and the existing broadcast-review flow. Cancel returns to editing. The acknowledgement applies only to that transaction creation attempt; subsequent attempts check again. Failed checks remain visible and do not permanently prohibit sending.

This is an online warning based on the API's current view, not a consensus-level replay protection mechanism or a guarantee of safety. Checks disclose queried transaction IDs to mempool.space. They do not send secrets or transactions to that service and do not change Purity networking or broadcast behavior.

All seven replay-check strings must be translated in each of the app's 71 supported locales. Each translation preserves the distinction between shared outputs and unknown checks, the possible spending of corresponding BTC on Bitcoin Core's chain, and explicit acceptance before continuing. Product names and `BTC` remain recognizable. These messages must not depend on English fallback.

## Release version

PurityWallet reports public version `1.1.0` in Android and all iOS/macOS app and extension configurations. Root npm package and lockfile versions match. Build-number configuration and application identities are retained.

### Android distribution compatibility

The public GitHub 1.0.0 APK uses `org.bitcoinpurity.puritywallet` with `versionCode` 1. Its signing certificate differs from the local temporary test key. Public upgrade artifacts must be signed with the original release key or an applicable supported signing lineage; temporary test signatures verify local behavior only. The recovered original key has signed the ARM64 1.1.0/code-2 upgrade, which passed an in-place update from the public 1.0.0 APK. The universal release must contain all four original ABIs (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) and pass original-signature and upgrade verification. Google Play distribution must retain an app-signing identity compatible with installed APKs. Developer organization verification is independent of the historical package-name prefix.

The four-ABI universal 1.1.0/code-2 APK has been built with the original release signature. All original native-library paths and expected ELF architectures were verified. A public 1.0.0 in-place upgrade and launch passed on Android 36 ARM64 without uninstalling or clearing data; UID/data directory/first-install time were retained. Other ABIs were verified statically, not runtime-tested.

### Apple app record boundary

The existing iOS 1.0.0 (2) IPA uses `org.bitcoinpurity.puritywallet` and was previously uploaded to TestFlight. Distribution using the selected new Apple Bundle ID `au.com.bitcoininstitute.puritywallet` requires a new App Store Connect record, matching signing/App Group capabilities, and matching APNs configuration; it cannot update the prior record. An Individual-to-Organization membership conversion alone does not require a Bundle ID change. These external account/app-record changes have not been performed.

## Coinbase spendability

Coinbase rewards remain in the wallet's total balance and complete Coin Control UTXO list. The spendable UTXO set and transaction selector exclude unknown, frozen and immature outputs. The consensus boundary is exactly `actualTip - coinbaseHeight + 1 >= 100`; ordinary unconfirmed spending retains its existing policy.

Coinbase classification comes from txid-verified raw transactions using bitcoinjs-lib. Raw transaction caching and deduplicated batches avoid repeated downloads. Unknown outputs remain owned and are retried on normal UTXO refresh. Actual Electrum headers and freshly retrieved UTXO/history heights establish maturity; wall-clock estimates and cached verbose confirmations cannot establish it. Any changed tip, disconnect or expired tip verification requires fresh Coinbase height verification.

All on-chain wallet constructors share the guarded selector, including Send Max, fees, manual selection, hardware/watch-only and multisig PSBT creation, RBF/CPFP and BIP47 notifications. No seed, derivation, signing or serialization format changes are required. A separate immature/spendable balance label is outside this focused repair; the existing headline balance continues to show total ownership.

## Coin Control immature-output badge

Coin Control shows an Immature badge (`未成熟` in Simplified and Traditional Chinese) on verified Coinbase outputs below 100 confirmations. It uses the same spendability rule as transaction construction and verified Electrum heights, without extra network requests during rendering. Mature and ordinary outputs have no Immature badge; unknown classification or unavailable/stale height verification is not displayed as confirmed immaturity.

The badge can coexist with Frozen and Change. Outputs remain visible and retain the existing selection behavior; the transaction-construction guard continues to prevent spending immature inputs. Normal refresh/re-render uses current verified maturity, including the 99/100-confirmation boundary and rollback.

## Send Coin Control button

The Send screen exposes Coin Control as a secondary button below the fee row and above Next. It uses the existing localized Coin Control title and navigates with the currently selected wallet ID. It remains available for an empty wallet and is disabled during transaction processing, matching the previous menu behavior.

The Send ellipsis menu no longer contains Coin Control. The selected-coins summary and frozen-balance shortcut still open the same Coin Control route. Existing selection, maturity filtering, signing and wallet switching behavior is retained.

The Wallet Details Coins statistic counts all owned UTXOs, including immature, unknown and frozen outputs, so Coin Control stays accessible when none are currently spendable. The spendable set and transaction-construction guard retain their separate policy.

## Multisig CI balance validation

The public multisig integration fixture validates its current balance against transaction-history accounting and retains its immutable historical funding assertion. A deterministic funded-to-empty refresh test preserves positive-balance coverage without requiring public funds to remain unspent. Lint, unit and integration jobs must pass in a clean Node 24 Linux container before this repair is committed and pushed; tests requiring unavailable secrets remain explicitly unverified.

## Native CI and signed release scope

PRs use the existing iOS/Android E2E build workflows and lint/unit/integration checks. Signed iOS and Android release workflows run only for pushes to `master` or manual dispatch and continue to require real signing credentials. Android SDK setup explicitly installs `platform-tools`, avoiding the removed legacy `tools` default.

Android E2E preparation waits for boot broadcasts (at most 120 seconds) and closes stale system dialogs before starting Detox. API 36 and the complete test suite remain enabled. ANR/crash reporting and application dialogs during test execution remain unchanged.

## E2E feature compatibility (REQ-013)

Default creation and entropy tests follow the preselected on-chain wallet type. Three vault-creation cases follow the production wallet-type flag; Lightning scan branches follow the Lightning flag. Multisig UR import and Send/Coin Control remain native UI checks. Historical Bitcoin hardware signatures are decoded, combined and cryptographically validated offline, without assuming Bitcoin funds exist on Purity. Production feature flags, endpoints and transaction rules remain unchanged.
