# Migration report

## BlueWallet to PurityWallet visible brand

This migration changes presentation only. It updates platform display labels, localized product references, distribution metadata, and artwork. It deliberately avoids renaming internal projects, targets, modules, identifiers, schemes, storage namespaces, endpoints, and dependency references so existing installs and integrations remain compatible.

The wallet artwork now uses a blue colorway of the Bitcoin Purity mark. The geometry and silver faceted center are retained, while the gold accents are replaced with cobalt/electric blue to distinguish PurityWallet from the gold Purity Node identity.

The About screen now links to the PurityWallet repository and the official Bitcoin Purity X account. The obsolete BlueWallet Telegram entry was removed because no corresponding Bitcoin Purity Telegram channel is published.

## Purity service defaults

Bundled Electrum peer lists are consolidated to the Bitcoin Purity TLS endpoint across JavaScript and native widget clients. The predefined block-explorer catalog is consolidated to the Bitcoin Purity mempool explorer. Persisted custom-service keys and parsing behavior are retained.

## In-wallet donation handoff

The Settings Donate action is migrated from the legacy `https://donate.bluewallet.io/` browser link to the existing on-chain Send flow. The recipient is centralized in one replaceable parameter. The initial value is deliberately invalid until the official PurityWallet developer address is supplied, preventing accidental payment to an arbitrary valid address.

## Temporary Lightning UI gate

Lightning and Ark creation choices and the Lightning Network settings row are hidden behind a disabled feature flag. No Lightning implementation or persisted data is removed, allowing the feature to be restored later without a wallet-data migration.
