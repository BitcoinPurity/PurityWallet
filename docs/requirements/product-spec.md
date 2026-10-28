# Product specification

## PurityWallet brand identity

The product is presented to users as **PurityWallet** on iOS, Android, macOS Catalyst, launch surfaces, in-app localized copy, and app-store metadata. Its app, splash, and in-app brand artwork uses a PurityWallet-specific blue colorway of the Bitcoin Purity mark so it is visually distinct from the gold Purity Node identity.

The iOS and macOS rebrand remains presentation-only, while Android uses an independent PurityWallet application identity so it can be installed alongside BlueWallet. iOS bundle identifiers, shared containers, deep links, native target/module names, storage keys, service endpoints, and upstream dependency references retain their current values.

### Acceptance criteria

- Installed application labels display `PurityWallet`.
- User-facing localized strings no longer display `BlueWallet` or `Blue Wallet`.
- iOS, macOS Catalyst, Android, splash, in-app, and store icon assets derive from one 1024 px PurityWallet blue master icon.
- The mark geometry and silver/white faceted center remain recognizable while gold accents are replaced by a saturated cobalt/electric-blue palette.
- Android uses `org.bitcoinpurity.puritywallet` for its application ID and code namespace.
- iOS and macOS package/bundle, app-group, URL-scheme, native module, storage, and network compatibility identifiers remain unchanged.
- Android shared storage key strings remain unchanged for JavaScript/native preference interoperability; changing the Android application ID creates a separate app data directory, so old BlueWallet data is restored through backup/import rather than automatic migration.

### Android application identity

PurityWallet is a separate Android application under `org.bitcoinpurity.puritywallet`. Package-dependent Android metadata and service configuration must use this identity. The checked-in Firebase package selector is aligned for local builds, but the complete Firebase Android client configuration must be generated for this package before production distribution.

## Purity network defaults

Fresh installations and default/reset behavior use only the Bitcoin Purity services below:

- Electrum: TLS at `electrum.bitcoinpurity.org:50002`
- Block explorer: `https://mempool.bitcoinpurity.org`

No other bundled fallback Electrum peers or predefined block explorers are offered. Explicit user configuration remains supported and is not overwritten.

## PurityWallet donations

The Settings Donate action remains inside PurityWallet. It asks the user to choose a send-capable on-chain wallet, then opens the standard Send screen with the configured donation recipient prefilled. The amount remains empty and the normal transaction review and confirmation flow is unchanged.

The recipient is defined by one replaceable configuration parameter. While the official developer address is pending, that parameter must contain an intentionally invalid placeholder rather than a valid third-party Bitcoin address.

### Acceptance criteria

- Donate does not open `donate.bluewallet.io` or another external donation page.
- Only send-capable on-chain wallets are offered for selection.
- The selected wallet ID and configured recipient are passed to the standard Send screen.
- No amount is preset and no transaction is automatically created, signed, or broadcast.

## Lightning feature visibility

Lightning support is temporarily unavailable as a user-selectable feature. The Add Wallet interface does not show Lightning, LNDHub, or Ark wallet choices, and Network settings does not show Lightning settings.

This is a reversible presentation gate. The underlying implementation, navigation contracts, and persisted wallet formats remain intact. Existing persisted Lightning wallets are not deleted or rewritten.

### Acceptance criteria

- Add Wallet does not expose Lightning wallet creation.
- Advanced wallet-type menus do not expose Lightning wallet creation.
- Network settings does not expose Lightning settings.
- Network settings and wallet-type selection remain controlled by disabled presentation flags.

## Standard Bitcoin wallet creation

The Add Wallet flow asks only for the wallet name and optional entropy. Its wallet-type controls are hidden, so the existing default state produces a native SegWit (`p2wpkh/HD`) Bitcoin wallet and proceeds to the standard backup screen.

The existing type-selection state, route parameters, wallet constructors, multisig screens, and import formats remain in the source for upstream compatibility. This is a presentation-only change.

### Acceptance criteria

- The Add Wallet screen does not show Bitcoin, multisig Vault, Lightning, or Ark type buttons.
- The Add Wallet header menu does not offer alternative wallet types.
- Without an explicit internal route override, Create follows the existing index `0` / on-chain default and instantiates `HDSegwitBech32Wallet`.
- Existing alternative wallet constructors, route parameters, and multisig screens are retained.
- Import Wallet remains available.

## Coinbase spendability

Coinbase rewards remain in the wallet's total balance and complete Coin Control UTXO list. The spendable UTXO set and transaction selector exclude unknown, frozen and immature outputs. The consensus boundary is exactly `actualTip - coinbaseHeight + 1 >= 100`; ordinary unconfirmed spending retains its existing policy.

Coinbase classification comes from txid-verified raw transactions using bitcoinjs-lib. Raw transaction caching and deduplicated batches avoid repeated downloads. Unknown outputs remain owned and are retried on normal UTXO refresh. Actual Electrum headers and freshly retrieved UTXO/history heights establish maturity; wall-clock estimates and cached verbose confirmations cannot establish it. Any changed tip, disconnect or expired tip verification requires fresh Coinbase height verification.

All on-chain wallet constructors share the guarded selector, including Send Max, fees, manual selection, hardware/watch-only and multisig PSBT creation, RBF/CPFP and BIP47 notifications. No seed, derivation, signing or serialization format changes are required. A separate immature/spendable balance label is outside this focused repair; the existing headline balance continues to show total ownership.

## Coin Control immature-output badge

Coin Control shows an Immature badge (`未成熟` in Simplified and Traditional Chinese) on verified Coinbase outputs below 100 confirmations. It uses the same spendability rule as transaction construction and verified Electrum heights, without extra network requests during rendering. Mature and ordinary outputs have no Immature badge; unknown classification or unavailable/stale height verification is not displayed as confirmed immaturity.

The badge can coexist with Frozen and Change. Outputs remain visible and retain the existing selection behavior; the transaction-construction guard continues to prevent spending immature inputs. Normal refresh/re-render uses current verified maturity, including the 99/100-confirmation boundary and rollback.

## Send Coin Control button

The Send screen exposes Coin Control as a secondary button below the fee row and above Next. It uses the existing localized Coin Control title and navigates with the currently selected wallet ID. It remains available for an empty wallet and is disabled during transaction processing, matching the previous menu behavior.

The Send ellipsis menu no longer contains Coin Control. The selected-coins summary and frozen-balance shortcut still open the same Coin Control route. Existing selection, maturity filtering, signing and wallet switching behavior is retained.

The Wallet Details Coins statistic counts all owned UTXOs, including immature, unknown and frozen outputs, so Coin Control stays accessible when none are currently spendable. The spendable set and transaction-construction guard retain their separate policy.

## Multisig CI balance validation

The public multisig integration fixture validates its current balance against transaction-history accounting and retains its immutable historical funding assertion. A deterministic funded-to-empty refresh test preserves positive-balance coverage without requiring public funds to remain unspent. Lint, unit and integration jobs must pass in a clean Node 24 Linux container before this repair is committed and pushed; tests requiring unavailable secrets remain explicitly unverified.

## Native CI and signed release scope

PRs use the existing iOS/Android E2E build workflows and lint/unit/integration checks. Signed iOS and Android release workflows run only for pushes to `master` or manual dispatch and continue to require real signing credentials. Android SDK setup explicitly installs `platform-tools`, avoiding the removed legacy `tools` default.

Android E2E preparation waits for boot broadcasts (at most 120 seconds) and closes stale system dialogs before starting Detox. API 36 and the complete test suite remain enabled. ANR/crash reporting and application dialogs during test execution remain unchanged.
