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

## Wallet creation compatibility

The `AddWallet` route retains its wallet-type and type-index parameters. Only the visible selector is disabled, leaving navigation contracts, wallet constructors, persisted serialization, import formats, and existing-wallet behavior unchanged. With no internal override, the upstream default remains native SegWit.

## Coinbase metadata and spending compatibility

UTXOs may contain optional `isCoinbase: boolean`. Absence means unknown; older wallets are lazily classified on their next normal UTXO refresh. Verified classification is backward compatible with JSON wallet storage; live height verification is memory-only and is never restored as trusted from storage. Seeds and derivation paths are unchanged.

The Electrum contract remains standard `blockchain.scripthash.listunspent`, `blockchain.scripthash.get_history`, `blockchain.transaction.get` and `blockchain.headers.subscribe`; no server-provided Coinbase flag or verbose support is required. Transaction construction remains synchronous. Callers supplying new UTXOs must resolve unknown status asynchronously with `BlueElectrum.prepareUtxos()` before construction. The shared selector excludes ineligible inputs even when manually supplied; an entirely ineligible set produces a diagnostic error.

`getUtxoSpendabilityReason()` exposes the synchronous policy result (`spendable`, `frozen`, `unknown_coinbase_status`, `unknown_chain_height`, or `immature_coinbase`) for Coin Control labels. The existing boolean helper delegates to it with unchanged spending behavior. The badge requires no navigation, storage or RPC changes.

The Send Coin Control button retains `navigate('CoinControl', { walletID })`. Moving this entry out of the Send ellipsis menu changes presentation only; existing routes, selected-coin parameters and frozen-balance shortcuts remain compatible.
