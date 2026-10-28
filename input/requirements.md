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

## REQ-007: Enforce Coinbase spendability

- Classify creating transactions using bitcoinjs-lib and cached raw Electrum transactions; missing status remains unknown and is retried on normal UTXO synchronization.
- Only spend Coinbase outputs when the actual connected Electrum tip satisfies `tipHeight - coinbaseHeight + 1 >= 100`.
- Enforce one shared rule for automatic/manual selection, Send Max, fees, RBF, CPFP and PSBT construction across on-chain wallet types; preserve ordinary unconfirmed spending and frozen-output policy.
- Retain immature/unknown outputs and total balance. Invalidate Coinbase height verification on tip changes, reconnects or stale tip data; refresh heights from listunspent/history, never estimated confirmations.
- Preserve storage, seed/derivation and Electrum protocol compatibility without new dependencies or UI redesign.

## REQ-008: Label immature Coinbase outputs in Coin Control

- Show a localized Immature badge beside Coinbase UTXOs that have fewer than 100 confirmations, using the existing verified chain-tip/height data and shared spendability rule.
- Do not label mature or ordinary outputs as immature. Missing classification or unavailable/stale height verification must not be presented as confirmed immaturity.
- Preserve output visibility, selection, frozen/change badges and existing transaction-construction safeguards.
- Wallet Details must count all owned UTXOs for the Coin Control entry, including wallets containing only immature, unknown or frozen outputs.

## REQ-009: Expose Coin Control directly on Send

- Move the Coin Control entry out of the Send screen's ellipsis menu into a visible secondary button above Next.
- Reuse the existing localized Coin Control title, selected-wallet navigation and loading-state protection.
- Keep the selected-coins summary, frozen-balance shortcut and coin-selection/spendability behavior unchanged.

## REQ-010: Keep multisig CI balance checks accurate

- Validate the public multisig wallet's current balance against its transaction history instead of assuming its funds remain unspent forever.
- Retain fixed historical funding assertions and deterministic coverage of funded-to-empty balance refreshes.
- Run the lint, unit and integration jobs in a clean Node 24 Linux container before committing and pushing the repair; retain existing secrets-related coverage limitations.

## REQ-011: Separate native PR validation from signed releases

- Run iOS and Android signed-release workflows only on pushes to `master` or manual dispatch; PRs retain the existing native E2E build checks and lint/unit/integration checks.
- Explicitly request `platform-tools` from the Android SDK setup action rather than its removed default `tools` package.
- Preserve production signing requirements; do not create substitute credentials or treat an unconfigured signed release as verified.

## REQ-012: Prepare Android emulator UI before E2E launch

- After emulator boot and before Detox starts, wait for pending boot broadcasts with a bounded timeout and close stale system startup dialogs.
- Retain Android API 36, all E2E cases, retries, synchronization and failure artifacts. Do not persistently suppress ANR/crash dialogs or dismiss dialogs after wallet tests start.

## REQ-013: Align E2E coverage with Purity feature availability

- Default wallet creation and dice entropy must use the already-selected on-chain type, without waiting for hidden type buttons.
- As explicitly requested, register the three vault-creation UI cases as skipped while wallet-type selection is disabled; restore them automatically when enabled. Gate Lightning-only scan checks by the existing Lightning flag and retain on-chain BIP21 coverage.
- Keep multisig UR import and Send/Coin Control navigation in E2E. Verify the historical Bitcoin hardware-signature fixture offline rather than requiring its UTXOs on the Purity chain. Do not enable hidden production features, change Electrum endpoints or relax spendability guards.
