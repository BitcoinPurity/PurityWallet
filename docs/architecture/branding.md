# Branding architecture

PurityWallet separates its public brand from inherited compatibility identifiers.

- Public name: `PurityWallet`
- Canonical artwork source: `img/puritywallet-logo.png`, a blue PurityWallet-specific derivative of the Bitcoin Purity mark
- Compatibility boundary: identifiers and names consumed by the operating system, React Native bridge, persisted storage, external integrations, and upstream dependencies remain unchanged.

There are no runtime architecture changes in this rebrand.

All platform, splash, in-app, and store icon derivatives are generated from the 1024 px PurityWallet master. iOS and store derivatives use opaque output where required; in-app, splash, and Android assets preserve transparency.

## Network defaults

JavaScript, iOS widget, and Android widget/client default-peer declarations share one logical Purity endpoint: `electrum.bitcoinpurity.org:50002` over TLS. The predefined explorer catalog contains the Purity mempool explorer plus the existing custom-URL entry.

## Donation flow

The Settings Donate action routes through the existing on-chain wallet selector and `SendDetailsRoot`. A single `PURITY_WALLET_DONATION_ADDRESS` parameter supplies the recipient. The standard Send flow retains address validation, amount entry, review, signing, and broadcast responsibilities.

## Feature visibility

Temporary product availability is controlled by `isLightningUiEnabled`. When disabled, wallet creation and Network settings omit Lightning entry points while Lightning wallet classes, routes, and persisted data remain unchanged.
