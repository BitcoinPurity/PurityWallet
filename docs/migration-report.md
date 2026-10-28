# Migration report

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
