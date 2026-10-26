# Migration report

## Legacy Bitcoin chain replay warnings

Add a read-only mempool.space mainnet check without migrating wallet data or changing Purity Electrum/broadcast configuration. Coin Control labels shared UTXOs, including frozen outputs. Send warns for shared selected inputs and repeats the check for actual coin-selected inputs before signing. All-shared transactions require explicit risk acknowledgement; unknown checks and cancellation stop signing. English and simplified/traditional Chinese copy cover checking, failure, replay risk, and acknowledgement. Existing signing and transaction review continue after the gate succeeds. API availability and accuracy bound this online warning; it is not protocol-level replay protection.

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
