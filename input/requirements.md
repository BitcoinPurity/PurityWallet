# Requirements

## REQ-001: PurityWallet visible-brand rebrand

- Replace user-visible `BlueWallet` branding with `PurityWallet` across the app and store metadata.
- Use a PurityWallet-specific blue colorway of the Bitcoin Purity logo so the wallet is visually distinct from Purity Node.
- The canonical GitHub repository is `https://github.com/PurityWallet/PurityWallet`; use it for the app's repository link, npm repository metadata, and local origin remote.
- Preserve URL schemes, native project/target/module names, wallet serialization, service endpoints, and dependency coordinates. Cross-platform application identities and shared preference groups are defined by REQ-016.

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

- Retain `org.bitcoinpurity.puritywallet` as the Android `applicationId` and code namespace to preserve the existing Android upgrade path (REQ-017).
- Keep URL schemes and wallet formats compatible; iOS identifiers and shared preference groups follow REQ-016.
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

## REQ-011: Separate native PR validation from release builds

- Run iOS and Android release-build workflows only on pushes to `master` or manual dispatch; PRs retain the existing native E2E build checks and lint/unit/integration checks.
- Explicitly request `platform-tools` from the Android SDK setup action rather than its removed default `tools` package.
- CI builds unsigned artifacts under REQ-019. Actual distribution still requires the correct production signing identity outside these CI workflows.

## REQ-012: Prepare Android emulator UI before E2E launch

- After emulator boot and before Detox starts, wait for pending boot broadcasts with a bounded timeout and close stale system startup dialogs.
- Retain Android API 36, all E2E cases, retries, synchronization and failure artifacts. Do not persistently suppress ANR/crash dialogs or dismiss dialogs after wallet tests start.

## REQ-013: Align E2E coverage with Purity feature availability

- Default wallet creation and dice entropy must use the already-selected on-chain type, without waiting for hidden type buttons.
- As explicitly requested, register the three vault-creation UI cases as skipped while wallet-type selection is disabled; restore them automatically when enabled. Gate Lightning-only scan checks by the existing Lightning flag and retain on-chain BIP21 coverage.
- Keep multisig UR import and Send/Coin Control navigation in E2E. Verify the historical Bitcoin hardware-signature fixture offline rather than requiring its UTXOs on the Purity chain. Do not enable hidden production features, change Electrum endpoints or relax spendability guards.

## REQ-014: Legacy Bitcoin chain replay warnings

- Use the read-only `https://mempool.space/api` Bitcoin mainnet API to check whether Purity UTXOs also remain unspent on the legacy Bitcoin Core chain.
- Coin Control checks every UTXO, including frozen outputs, and prominently marks matching outputs with a replay-risk warning.
- Send checks selected inputs and displays a warning when all of them exist on the legacy chain. Before signing, repeat the check against the actual inputs chosen by coin selection, including automatic selection.
- When every actual input matches, require explicit acknowledgement that the transaction may also spend BTC on the legacy chain before signing or continuing to broadcast review. Cancelling stops transaction creation.
- Compare transaction ID, output index, value, and output script, and require an unspent output. A transaction's historical existence alone is insufficient.
- Show pending/failed checks explicitly. A failed check must not be treated as absence. Explain that replay risk cannot be determined and allow the user to proceed to signing and broadcast review only after explicit risk acknowledgement; cancellation stops the attempt.
- Checks send only transaction IDs to mempool.space, never private keys or signed transaction data. Purity Electrum and broadcast settings remain unchanged.
- Provide all seven replay-check messages in every supported app language, including failed-check uncertainty and explicit risk acknowledgement, without relying on English fallback for these messages.

## REQ-015: PurityWallet 1.1.0 version

- Set the app's public version to `1.1.0` consistently in Android, iOS/macOS app and extension targets, and root npm package metadata.
- Preserve wallet data and service contracts; platform application identities and Android build-number progression follow REQ-016 and REQ-017.

## REQ-016: Apple application identity and platform compatibility

- Use `au.com.bitcoininstitute.puritywallet` for the iOS/macOS main app Bundle ID. Android retains its original application identity under REQ-017.
- Use `.Stickers` and `.MarketWidget` suffixes for the existing Apple extension targets.
- Use `group.au.com.bitcoininstitute.puritywallet` for the Apple App Group and Apple shared preference clients. Android shared preference clients retain `group.io.bluewallet.bluewallet` under REQ-017.
- Align native source packages, codegen metadata, Android package selectors, Apple signing/export configuration, background task and user-activity identifiers, install/deep-link scripts, and app-store links with the new application identity.
- Preserve native project/target/module names, URL schemes, wallet serialization, Purity service endpoints, and the GitHub organization `PurityWallet`.
- Apple builds with a changed identity remain separate from prior Apple installations and require explicit wallet backup/import. Do not delete existing apps or data; Android follows the in-place upgrade requirements in REQ-017.

## REQ-017: Preserve the Android upgrade path

- Retain Android application ID/namespace `org.bitcoinpurity.puritywallet`, including native/codegen references, the Firebase package selector, store links, and install scripts.
- Retain Android shared preferences under `group.io.bluewallet.bluewallet`, including currency, privacy, native settings, and widget clients. Select the preference namespace per platform in shared JavaScript.
- Keep the public version at `1.1.0` and increase the local Android `versionCode` from `1` to `2`. Release automation must accept the updated base code and use a value higher than every previously distributed build.
- Use the same existing app-signing key (or a valid supported signing lineage) for APK and Google Play updates. App-signing identity is distinct from an upload key and the developer organization's domain.
- Build a single universal APK covering all four architectures present in public 1.0.0: `armeabi-v7a`, `arm64-v8a`, `x86`, and `x86_64`. Sign with the recovered original release key and verify package/version/signature continuity and in-place upgrade behavior.
- Verify an in-place emulator upgrade of the original Android package without uninstalling it or clearing its data. Keep the separate experimental `au.com.bitcoininstitute.puritywallet` Android app/data untouched.
- Keep Apple Bundle IDs/App Groups under `au.com.bitcoininstitute.puritywallet`, and preserve the GitHub organization `PurityWallet`.

## REQ-018: Operate a BitcoinPurity notification service

- Deploy the wallet notification backend on `ubuntu@node1` and expose it at `https://notifications.bitcoinpurity.org`.
- Send push tokens and payment subscriptions only to the BitcoinPurity service, with no fallback to BlueWallet-operated notification endpoints.
- Preserve the existing Ground Control registration, configuration, unsubscribe, and test-notification API contracts.
- Observe the Purity chain and use the PurityWallet APNs topic `au.com.bitcoininstitute.puritywallet`.
- Enable production iOS delivery only for this release; temporarily disable Android remote push registration and its settings entry until BitcoinPurity FCM credentials are available.
- Keep the optional Ark payment-push endpoint disabled while Ark creation is unavailable and no BitcoinPurity equivalent is deployed.
- Validate the deployed backend before rebuilding and submitting the iOS release; update the public privacy policy to match the actual service and retention behavior.
- Align the in-app notification disclosure with the deployed retention rules: disabling delivery or uninstalling does not erase server records; unsubscribe removes the specified payment subscriptions, not existing logs. Describe delivery records (about 3 days), operational logs (about 7 days), startup cleanup of transaction-ID subscriptions older than about 90 days, and address/preferences retention until removal.
- Maintain complete English, Simplified Chinese, and Traditional Chinese notification disclosures; other locales use the existing English fallback until their corrected translations are available. Preserve this disclosure when rebuilding the current release.
- Align the backend APNs topic with REQ-016. Prior device-delivery evidence belongs to the old Apple identity; verify new Apple app records, profiles, credentials, and actual-device delivery before distributing the new identity. This source integration does not modify deployed services.

## REQ-019: Build Android and iOS CI artifacts without release signing

- Keep the existing master-push/manual release-build triggers, app identities, public version, build-number progression, and PR E2E/test workflows.
- Build and upload an explicitly unsigned Android Release APK without release keystores, signing passwords, or substitute signing keys.
- Build and upload an unsigned iOS device archive with code signing disabled; do not create/import signing keychains, fetch provisioning profiles, export an App Store IPA, or upload to TestFlight in CI.
- Remove CI dependencies on Android and Apple release-signing credentials. Retain local/manual signed-release tooling and production signing requirements outside these workflows.
- Label CI artifacts as unsigned. They require appropriate signing before installation or distribution and do not verify a production release or upgrade.
