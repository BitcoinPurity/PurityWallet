# Wallet balance validation

Live Electrum tests exercise wallet discovery, transaction parsing and balance aggregation against the configured Purity server. A public fixture's current balance is mutable: the multisig fixture received 108880 sats in transaction `98250695c4041a936a0da1d7a39c5e252275bbe3865d6b0ee6754763b36490ca` and later spent them in `8da31011618b5d08696409c3b5a510cfc35da19c766e7b7572482cbc97c18441`.

The multisig integration test retains the immutable funding amount, requires outgoing history, and reconciles the full transaction-history net with the separately fetched Electrum balance. Positive unconfirmed value is added back to `getBalance()` for this comparison because the wallet's balance policy already includes negative unconfirmed value.

A separate unit test supplies deterministic funded and spent Electrum balance responses and verifies that a normal refresh updates 108880 sats to zero. It preserves funded-wallet coverage without depending on public funds staying unspent. The production wallet's balance, derivation, signing and network logic remain unchanged.

The lint, unit and complete integration jobs from `ci.yml` run in an isolated official Node 24 Linux container. No host dependencies or credentials are mounted. Missing test secrets still limit legacy test coverage; native E2E and release jobs are separate validations.

Native E2E build workflows remain PR-triggered. Release-build workflows are triggered only by `master` pushes or manual dispatch. Under REQ-019 Android Gradle builds an unsigned Release APK, and Xcode archives the iOS device app with code signing disabled. Artifact upload retains the unsigned APK and a compressed `.xcarchive`; no keychain/provisioning setup, App Store export, or TestFlight upload runs. Local/manual signed-release tools remain separate. Neither CI release builds nor PR validation depend on publishing credentials. Android SDK setup overrides the pinned action's `tools platform-tools` default with `platform-tools`; required platform/build-tools/NDK versions remain in the existing explicit SDK installation step.

The Android emulator runner's boot-completed flag does not guarantee SystemUI has completed startup. A cold-boot SystemUI ANR can leave a system dialog holding focus after the launcher and wallet become ready. Before Detox installs/launches the wallet, the workflow waits for broadcast queues to become idle (bounded by 120 seconds) and sends `CLOSE_SYSTEM_DIALOGS` once. No dialog suppression setting or per-launch/per-test dismissal is introduced, so wallet errors during tests remain observable.

## E2E feature and fixture boundaries

The standard creation helper uses the existing default on-chain selection. Three vault-creation cases register through the production wallet-type flag, with a unit test verifying exactly three skips when disabled and all 13 cases registered when enabled. Lightning-only scanner branches follow the Lightning flag; single-wallet on-chain BIP21 remains exercised.

The old multisig hardware E2E case attempted to spend historical Bitcoin funds while connected to the Purity Electrum server. Its native case now covers wallet UR import and Send/Coin Control navigation. The unchanged public wallet/Passport/Keystone UR fragments live in a shared fixture; an offline unit test checks zero, one and two signatures, validates every signature and finalizes the expected 50000-sat recipient transaction. This retains signing logic coverage but does not replace native multisig cosign-screen coverage on a funded Purity fixture. Existing watch-only hardware PSBT UI coverage remains in `bluewallet3.spec.js`.
