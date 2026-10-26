# Requirements

## REQ-001: PurityWallet visible-brand rebrand

- Replace user-visible `BlueWallet` branding with `PurityWallet` across the app and store metadata.
- Use a PurityWallet-specific blue colorway of the Bitcoin Purity logo so the wallet is visually distinct from Purity Node.
- Preserve existing iOS bundle IDs, iOS app groups, URL schemes, native project/target/module names, storage keys, service endpoints, and dependency coordinates. The Android application identity is defined separately by REQ-005.

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

- Use `org.bitcoinpurity.puritywallet` as the Android `applicationId` and code namespace.
- Keep iOS bundle identifiers, iOS app groups, URL schemes, and shared storage keys unchanged.
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
