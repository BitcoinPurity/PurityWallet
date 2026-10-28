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

## Coinbase metadata and spending compatibility

UTXOs may contain optional `isCoinbase: boolean`. Absence means unknown; older wallets are lazily classified on their next normal UTXO refresh. Verified classification is backward compatible with JSON wallet storage; live height verification is memory-only and is never restored as trusted from storage. Seeds and derivation paths are unchanged.

The Electrum contract remains standard `blockchain.scripthash.listunspent`, `blockchain.scripthash.get_history`, `blockchain.transaction.get` and `blockchain.headers.subscribe`; no server-provided Coinbase flag or verbose support is required. Transaction construction remains synchronous. Callers supplying new UTXOs must resolve unknown status asynchronously with `BlueElectrum.prepareUtxos()` before construction. The shared selector excludes ineligible inputs even when manually supplied; an entirely ineligible set produces a diagnostic error.

`getUtxoSpendabilityReason()` exposes the synchronous policy result (`spendable`, `frozen`, `unknown_coinbase_status`, `unknown_chain_height`, or `immature_coinbase`) for Coin Control labels. The existing boolean helper delegates to it with unchanged spending behavior. The badge requires no navigation, storage or RPC changes.

The Send Coin Control button retains `navigate('CoinControl', { walletID })`. Moving this entry out of the Send ellipsis menu changes presentation only; existing routes, selected-coin parameters and frozen-balance shortcuts remain compatible.

Wallet Details reads the existing `getUtxo(true)` complete-set contract for its Coins count; the Coin Control route and transaction-selection contracts are unchanged.

Multisig CI validation reconciles the existing wallet balance with transaction history using the same Electrum methods. This test-only repair does not change balance policy, RPC requirements, derivation, signing or stored wallet formats. See [wallet balance validation](../architecture/testing.md).

Restricting signed-release workflows to `master` pushes/manual dispatch and overriding the Android SDK package list changes CI scheduling/setup only. Signing identities, publishing credentials, application protocols and wallet storage are unchanged; native E2E build checks remain enabled for PRs.

Android E2E boot preparation uses standard API 36 `am` shell commands before Detox starts. It changes no application APIs, permissions, wallet state, runtime dialog policy or test selection.

E2E feature gating and offline historical hardware fixtures change tests only. No production feature, Electrum RPC/endpoint, wallet storage, seed, signing or Coinbase spendability contract changes. See REQ-013 and the E2E feature/fixture boundaries in the testing architecture.
