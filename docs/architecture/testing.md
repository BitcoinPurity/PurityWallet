# Wallet balance validation

Live Electrum tests exercise wallet discovery, transaction parsing and balance aggregation against the configured Purity server. A public fixture's current balance is mutable: the multisig fixture received 108880 sats in transaction `98250695c4041a936a0da1d7a39c5e252275bbe3865d6b0ee6754763b36490ca` and later spent them in `8da31011618b5d08696409c3b5a510cfc35da19c766e7b7572482cbc97c18441`.

The multisig integration test retains the immutable funding amount, requires outgoing history, and reconciles the full transaction-history net with the separately fetched Electrum balance. Positive unconfirmed value is added back to `getBalance()` for this comparison because the wallet's balance policy already includes negative unconfirmed value.

A separate unit test supplies deterministic funded and spent Electrum balance responses and verifies that a normal refresh updates 108880 sats to zero. It preserves funded-wallet coverage without depending on public funds staying unspent. The production wallet's balance, derivation, signing and network logic remain unchanged.

The lint, unit and complete integration jobs from `ci.yml` run in an isolated official Node 24 Linux container. No host dependencies or credentials are mounted. Missing test secrets still limit legacy test coverage; native E2E and release jobs are separate validations.

Native E2E build workflows remain PR-triggered. Signed-release workflows are triggered only by `master` pushes or manual dispatch, so PR validation does not depend on publishing credentials. Android SDK setup overrides the pinned action's `tools platform-tools` default with `platform-tools`; required platform/build-tools/NDK versions remain in the existing explicit SDK installation step.

The Android emulator runner's boot-completed flag does not guarantee SystemUI has completed startup. A cold-boot SystemUI ANR can leave a system dialog holding focus after the launcher and wallet become ready. Before Detox installs/launches the wallet, the workflow waits for broadcast queues to become idle (bounded by 120 seconds) and sends `CLOSE_SYSTEM_DIALOGS` once. No dialog suppression setting or per-launch/per-test dismissal is introduced, so wallet errors during tests remain observable.
