# API compatibility

## Legacy-chain read-only API

Replay checks use Bitcoin mainnet `https://mempool.space/api/tx/:txid` and `/tx/:txid/outspends`. The transaction response must contain the requested `txid` and a `vout` array of `value` (integer satoshis) and `scriptpubkey` (hex). The outspends response is indexed by output number and must provide a boolean `spent`. An explicit 404 on the transaction endpoint means absent; other unsuccessful or malformed responses mean unknown. Requests time out after 10 seconds and at most four transaction groups are checked concurrently.

Only transaction IDs are disclosed to this third-party service; no keys or signed transactions are sent. Purity Electrum preferences, transaction/broadcast protocols, wallet storage, and navigation parameters remain unchanged.

An unknown result requires a distinct replay-risk acknowledgement before signing, while still allowing an informed user to continue. It does not permanently block sending or imply that the output is absent.

All supported app locales provide the same seven replay-check localization keys. This changes translated presentation only; API responses and transaction/navigation contracts are unchanged.

Android retains public identity `org.bitcoinpurity.puritywallet` and shared preference namespace `group.io.bluewallet.bluewallet`. Apple uses `au.com.bitcoininstitute.puritywallet`, extension suffixes `.Stickers` and `.MarketWidget`, and App Group/preferences `group.au.com.bitcoininstitute.puritywallet`. Shared JavaScript selects the group per platform. Background task and user-activity identifiers follow the new app identity. Public URL schemes, native bridge module names, Electrum endpoints, and wallet serialization remain compatible.

## Application identity and service compatibility

Android updates retain the original package and preference namespace to preserve application data and settings, and must use the existing compatible app-signing identity and a higher distributed build code. Android Firebase package metadata must match `org.bitcoinpurity.puritywallet`. Apple App Group entitlements and Apple native/JavaScript preference clients use `group.au.com.bitcoininstitute.puritywallet`; changed Apple IDs/groups remain separate data namespaces. The experimental renamed Android package is also separate and is not automatically migrated. No existing applications/data are deleted.

The universal Android APK retains all four public 1.0.0 ABIs (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`). This packaging change does not change service APIs, wallet serialization, or preference keys.

## Configurable service compatibility

The bundled defaults are `electrum.bitcoinpurity.org:50002:s` and `https://mempool.bitcoinpurity.org`. Existing Electrum preference keys and block-explorer storage formats are unchanged, so explicit saved custom values remain compatible.

## Donation navigation contract

Donate uses the existing internal `SelectWallet` and `SendDetailsRoot` routes. It passes the selected on-chain `walletID` and the configured `PURITY_WALLET_DONATION_ADDRESS` as the Send recipient. It does not change public deep links, serialized formats, or external APIs.

## Lightning compatibility

Disabling `isLightningUiEnabled` changes only visible feature entry points. Existing Lightning classes, route names, backup formats, and persisted wallet records remain compatible and are not migrated or deleted.

## Wallet creation compatibility

The `AddWallet` route retains its wallet-type and type-index parameters. Only the visible selector is disabled, leaving navigation contracts, wallet constructors, persisted serialization, import formats, and existing-wallet behavior unchanged. With no internal override, the upstream default remains native SegWit.

## Version 1.1.0

The public version update changes release metadata only; API, protocol, navigation, application identity, and wallet storage contracts remain compatible.

## GitHub repository location

The canonical repository is `PurityWallet/PurityWallet`. Updating repository links and the local origin URL does not change application identities, wallet storage, or network/API contracts.

The prior iOS/TestFlight record uses `org.bitcoinpurity.puritywallet`. Publishing the new Apple Bundle ID requires a separate app record and matching APNs topic/signing/capability configuration. This source change does not migrate those external records or the existing notification backend configuration.
