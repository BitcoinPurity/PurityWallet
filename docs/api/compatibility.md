# API compatibility

The PurityWallet visible-brand rebrand makes no API or protocol changes. iOS/macOS deep-link schemes, activity types, bundle identifiers, app groups, native bridge module names, Electrum endpoints, and serialized formats remain unchanged. Android now uses the independent application ID and code namespace `org.bitcoinpurity.puritywallet`.

## Android identity and service compatibility

The Android application ID change creates a separate Android app data directory. Existing BlueWallet data is not copied automatically; wallet backup/import remains the supported migration path. Android Firebase package metadata must match `org.bitcoinpurity.puritywallet`.

## Configurable service compatibility

The bundled defaults are `electrum.bitcoinpurity.org:50002:s` and `https://mempool.bitcoinpurity.org`. Existing Electrum preference keys and block-explorer storage formats are unchanged, so explicit saved custom values remain compatible.

## Donation navigation contract

Donate uses the existing internal `SelectWallet` and `SendDetailsRoot` routes. It passes the selected on-chain `walletID` and the configured `PURITY_WALLET_DONATION_ADDRESS` as the Send recipient. It does not change public deep links, serialized formats, or external APIs.

## Lightning compatibility

Disabling `isLightningUiEnabled` changes only visible feature entry points. Existing Lightning classes, route names, backup formats, and persisted wallet records remain compatible and are not migrated or deleted.
