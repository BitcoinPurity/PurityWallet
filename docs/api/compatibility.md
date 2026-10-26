# API compatibility

## Legacy-chain read-only API

Replay checks use Bitcoin mainnet `https://mempool.space/api/tx/:txid` and `/tx/:txid/outspends`. The transaction response must contain the requested `txid` and a `vout` array of `value` (integer satoshis) and `scriptpubkey` (hex). The outspends response is indexed by output number and must provide a boolean `spent`. An explicit 404 on the transaction endpoint means absent; other unsuccessful or malformed responses mean unknown. Requests time out after 10 seconds and at most four transaction groups are checked concurrently.

Only transaction IDs are disclosed to this third-party service; no keys or signed transactions are sent. Purity Electrum preferences, transaction/broadcast protocols, wallet storage, and navigation parameters remain unchanged.

An unknown result requires a distinct replay-risk acknowledgement before signing, while still allowing an informed user to continue. It does not permanently block sending or imply that the output is absent.

All supported app locales provide the same seven replay-check localization keys. This changes translated presentation only; API responses and transaction/navigation contracts are unchanged.

The PurityWallet visible-brand rebrand makes no API or protocol changes. iOS/macOS deep-link schemes, activity types, bundle identifiers, app groups, native bridge module names, Electrum endpoints, and serialized formats remain unchanged. Android now uses the independent application ID and code namespace `org.bitcoinpurity.puritywallet`.

## Android identity and service compatibility

The Android application ID change creates a separate Android app data directory. Existing BlueWallet data is not copied automatically; wallet backup/import remains the supported migration path. Android Firebase package metadata must match `org.bitcoinpurity.puritywallet`.

## Configurable service compatibility

The bundled defaults are `electrum.bitcoinpurity.org:50002:s` and `https://mempool.bitcoinpurity.org`. Existing Electrum preference keys and block-explorer storage formats are unchanged, so explicit saved custom values remain compatible.

## Donation navigation contract

Donate uses the existing internal `SelectWallet` and `SendDetailsRoot` routes. It passes the selected on-chain `walletID` and the configured `PURITY_WALLET_DONATION_ADDRESS` as the Send recipient. It does not change public deep links, serialized formats, or external APIs.

## Lightning compatibility

Disabling `isLightningUiEnabled` changes only visible feature entry points. Existing Lightning classes, route names, backup formats, and persisted wallet records remain compatible and are not migrated or deleted.

## Wallet creation compatibility

The `AddWallet` route retains its wallet-type and type-index parameters. Only the visible selector is disabled, leaving navigation contracts, wallet constructors, persisted serialization, import formats, and existing-wallet behavior unchanged. With no internal override, the upstream default remains native SegWit.
