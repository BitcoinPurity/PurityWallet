# PurityWallet Privacy Policy

**Effective date: October 25, 2026**

PurityWallet is a self-custody Bitcoin wallet. This policy describes information handled by the iOS app and the services it uses.

## Information stored on your device

Wallets, recovery information, preferences, and transaction data are stored in the app on your device. PurityWallet does not require an account. The app does not intentionally send your private keys or recovery phrases to its service providers. If you export or share a backup, you choose where it is sent.

## Information sent to network services

When you use a wallet, PurityWallet connects to the Electrum server configured for that wallet. The default Purity network server is `electrum.bitcoinpurity.org`. Electrum requests can include public wallet script hashes and transaction identifiers needed to retrieve balances and transaction history. The server also receives ordinary connection information such as your IP address. You can configure a different Electrum server. Bitcoin transactions broadcast to the public network are public.

## Optional payment notifications

If you enable notifications and allow them in iOS, PurityWallet registers an Apple Push Notification service token with the notification service at `groundcontrol.bluewallet.io`. To watch for incoming payments, the app can send that service the notification token, platform, Bitcoin addresses, transaction IDs, and Lightning invoice payment hashes that you selected for notifications. This lets the service associate those payment subscriptions with your device and send a notification when it detects a payment. Apple also processes the push token and notification delivery under Apple's own terms and privacy practices.

You can disable notifications in iOS Settings or in PurityWallet. When a subscription is removed, the app sends an unsubscribe request for its payment identifiers. The service's retention practices are controlled by that service; this project does not control or verify its retention period.

## Error diagnostics

PurityWallet includes Bugsnag error-reporting software operated by SmartBear. When the app's Do Not Track setting is off, Bugsnag may receive crash reports, error details, app and device information, diagnostic breadcrumbs, and a pseudonymous device identifier. These reports help diagnose app failures. Enable Do Not Track in PurityWallet settings to disable Bugsnag reporting for subsequent errors. Information already received by Bugsnag is subject to SmartBear's policies and retention practices.

PurityWallet does not use this information for advertising or cross-app tracking, and this project does not sell it. Firebase Analytics collection and automatic Firebase Messaging initialization are disabled in the iOS app.

## Service providers and links

Electrum servers, Apple Push Notification service, the Ground Control notification service, and Bugsnag process information as needed to provide the functions described above. Their handling of information is governed by their respective terms and privacy policies. PurityWallet may link to third-party services and websites that have their own privacy practices.

## Your choices and deletion

You can remove wallets and app data from PurityWallet or uninstall the app. You can turn off notifications or remove individual payment subscriptions from the app. These actions do not delete information that has already been received by a third-party service. Contact the project through the [PurityWallet GitHub repository](https://github.com/BitcoinPurity/PurityWallet) for privacy questions or requests related to this policy.

## Changes

This policy may be updated when the app's data practices change. The effective date above indicates the latest revision.
