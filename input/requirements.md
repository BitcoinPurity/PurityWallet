# Requirements

## REQ-001: PurityWallet visible-brand rebrand

- Replace user-visible `BlueWallet` branding with `PurityWallet` across the app and store metadata.
- Use a PurityWallet-specific blue colorway of the Bitcoin Purity logo so the wallet is visually distinct from Purity Node.
- The canonical GitHub repository is `https://github.com/PurityWallet/PurityWallet`; use it for the app's repository link, npm repository metadata, and local origin remote.
- Preserve URL schemes, native project/target/module names, wallet serialization, service endpoints, and dependency coordinates. Cross-platform application identities and shared preference groups are defined by REQ-009.

## REQ-002: Purity network defaults

- The only bundled default Electrum server is `electrum.bitcoinpurity.org:50002:s`.
- The only bundled predefined block explorer is `https://mempool.bitcoinpurity.org`.
- User-configured Electrum servers and custom block-explorer URLs remain supported.

## REQ-003: In-wallet PurityWallet donations

- Tapping Donate opens the wallet's on-chain send flow instead of an external BlueWallet website.
- The user selects a send-capable on-chain wallet before entering the send screen.
- The recipient is supplied through one replaceable PurityWallet donation-address parameter; no amount is preset and no payment is sent without normal user review and confirmation.
- Until the official address is configured, use an intentionally invalid placeholder so funds cannot be sent to an unrelated address.

## REQ-004: Temporarily hide Lightning features

- PurityWallet does not currently offer Lightning wallet creation or Lightning network settings in the user interface.
- Hide the Lightning and Ark wallet-type choices, including advanced wallet-type menus.
- Preserve the underlying Lightning implementation and persisted wallet data for future re-enablement and compatibility.

## REQ-005: Independent Android application identity

- Retain `org.bitcoinpurity.puritywallet` as the Android `applicationId` and code namespace to preserve the existing Android upgrade path (REQ-010).
- Keep URL schemes and wallet formats compatible; iOS identifiers and shared preference groups follow REQ-009.
- Update Android native package references, React Native codegen configuration, Firebase package metadata, and Android install/test scripts to the new identity.
- Allow the Android PurityWallet build to coexist with BlueWallet as a separate application. Existing BlueWallet app data is not migrated automatically; users must use the wallet backup/import flow.

## REQ-006: Create one standard Bitcoin wallet type

- Hide wallet-type selection in the new-wallet interface so the unchanged default creates a native SegWit Bitcoin wallet.
- Keep the existing multisig, legacy, Taproot, Lightning, and Ark creation implementations and navigation contracts in place for upstream compatibility.
- Keep wallet import and compatibility with existing wallets unchanged.

## REQ-007: Legacy Bitcoin chain replay warnings

- Use the read-only `https://mempool.space/api` Bitcoin mainnet API to check whether Purity UTXOs also remain unspent on the legacy Bitcoin Core chain.
- Coin Control checks every UTXO, including frozen outputs, and prominently marks matching outputs with a replay-risk warning.
- Send checks selected inputs and displays a warning when all of them exist on the legacy chain. Before signing, repeat the check against the actual inputs chosen by coin selection, including automatic selection.
- When every actual input matches, require explicit acknowledgement that the transaction may also spend BTC on the legacy chain before signing or continuing to broadcast review. Cancelling stops transaction creation.
- Compare transaction ID, output index, value, and output script, and require an unspent output. A transaction's historical existence alone is insufficient.
- Show pending/failed checks explicitly. A failed check must not be treated as absence. Explain that replay risk cannot be determined and allow the user to proceed to signing and broadcast review only after explicit risk acknowledgement; cancellation stops the attempt.
- Checks send only transaction IDs to mempool.space, never private keys or signed transaction data. Purity Electrum and broadcast settings remain unchanged.
- Provide all seven replay-check messages in every supported app language, including failed-check uncertainty and explicit risk acknowledgement, without relying on English fallback for these messages.

## REQ-008: PurityWallet 1.1.0 version

- Set the app's public version to `1.1.0` consistently in Android, iOS/macOS app and extension targets, and root npm package metadata.
- Preserve wallet data and service contracts; platform application identities and Android build-number progression follow REQ-009 and REQ-010.

## REQ-009: Apple application identity and platform compatibility

- Use `au.com.bitcoininstitute.puritywallet` for the iOS/macOS main app Bundle ID. Android retains its original application identity under REQ-010.
- Use `.Stickers` and `.MarketWidget` suffixes for the existing Apple extension targets.
- Use `group.au.com.bitcoininstitute.puritywallet` for the Apple App Group and Apple shared preference clients. Android shared preference clients retain `group.io.bluewallet.bluewallet` under REQ-010.
- Align native source packages, codegen metadata, Android package selectors, Apple signing/export configuration, background task and user-activity identifiers, install/deep-link scripts, and app-store links with the new application identity.
- Preserve native project/target/module names, URL schemes, wallet serialization, Purity service endpoints, and the GitHub organization `PurityWallet`.
- Apple builds with a changed identity remain separate from prior Apple installations and require explicit wallet backup/import. Do not delete existing apps or data; Android follows the in-place upgrade requirements in REQ-010.

## REQ-010: Preserve the Android upgrade path

- Retain Android application ID/namespace `org.bitcoinpurity.puritywallet`, including native/codegen references, the Firebase package selector, store links, and install scripts.
- Retain Android shared preferences under `group.io.bluewallet.bluewallet`, including currency, privacy, native settings, and widget clients. Select the preference namespace per platform in shared JavaScript.
- Keep the public version at `1.1.0` and increase the local Android `versionCode` from `1` to `2`. Release automation must accept the updated base code and use a value higher than every previously distributed build.
- Use the same existing app-signing key (or a valid supported signing lineage) for APK and Google Play updates. App-signing identity is distinct from an upload key and the developer organization's domain.
- Build a single universal APK covering all four architectures present in public 1.0.0: `armeabi-v7a`, `arm64-v8a`, `x86`, and `x86_64`. Sign with the recovered original release key and verify package/version/signature continuity and in-place upgrade behavior.
- Verify an in-place emulator upgrade of the original Android package without uninstalling it or clearing its data. Keep the separate experimental `au.com.bitcoininstitute.puritywallet` Android app/data untouched.
- Keep Apple Bundle IDs/App Groups under `au.com.bitcoininstitute.puritywallet`, and preserve the GitHub organization `PurityWallet`.
