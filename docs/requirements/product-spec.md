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

- Add Wallet shows only supported on-chain and multisig choices.
- Advanced wallet-type menus do not expose Lightning wallet creation.
- Network settings does not expose Lightning settings.
- One disabled feature flag controls these UI entry points.
