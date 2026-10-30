# PurityWallet Privacy Policy

**Effective date: October 25, 2026**

PurityWallet is a self-custody Bitcoin Purity wallet. This policy describes information handled by the iOS app and the services it uses.

## Information stored on your device

Wallets, recovery information, preferences, and transaction data are stored in the app on your device. PurityWallet does not require an account. The app does not intentionally send your private keys or recovery phrases to its service providers. If you export or share a backup, you choose where it is sent.

## Information sent to network services

When you use a wallet, PurityWallet connects to the Electrum server configured for that wallet. The default Purity network server is `electrum.bitcoinpurity.org`. Electrum requests can include public wallet script hashes and transaction identifiers needed to retrieve balances and transaction history. The server also receives ordinary connection information such as your IP address. You can configure a different Electrum server. Bitcoin Purity transactions broadcast to the public network are public.

## Optional payment notifications

If you enable notifications and allow them in iOS, PurityWallet registers an Apple Push Notification service token with the BitcoinPurity notification service at `notifications.bitcoinpurity.org`. To watch for incoming payments, the app can send that service the notification token, platform, Bitcoin addresses, transaction IDs, and Lightning invoice payment hashes that you selected for notifications. This lets the service associate those payment subscriptions with your device and send a notification when it detects a payment. The service observes the Purity network. Apple also processes the push token and notification delivery under Apple's own terms and privacy practices.

BitcoinPurity operates this notification service for PurityWallet. You can disable notifications in iOS Settings or in PurityWallet. When a subscription is removed, the app sends an unsubscribe request for its payment identifiers. Disabling delivery does not by itself erase existing subscriptions, and uninstalling the app does not send an unsubscribe request. Contact the project through the repository linked below for requests concerning information stored by the BitcoinPurity service.

The service also stores notification preferences, language, app version, and a last-online timestamp. Web access logs include connection information such as IP addresses; application logs can include the registered token and payment identifiers. These operational logs are normally retained for approximately seven days, with application logs also limited by available log space and cleared on server restart. Notification delivery records are purged after approximately three days. Address subscriptions and device preferences can remain until removed; transaction-ID subscriptions older than approximately 90 days are purged when the service starts. Invalid-token cleanup can remove payment subscriptions. This release enables remote notifications only on iOS and does not register Android remote push tokens.

## Error diagnostics

PurityWallet includes Bugsnag error-reporting software operated by SmartBear. When the app's Do Not Track setting is off, Bugsnag may receive crash reports, error details, app and device information, diagnostic breadcrumbs, and a pseudonymous device identifier. These reports help diagnose app failures. Enable Do Not Track in PurityWallet settings to disable Bugsnag reporting for subsequent errors. Information already received by Bugsnag is subject to SmartBear's policies and retention practices.

PurityWallet does not use this information for advertising or cross-app tracking, and this project does not sell it. Firebase Analytics collection and automatic Firebase Messaging initialization are disabled in the iOS app.

## Service providers and links

The BitcoinPurity notification service processes information as described in this policy. Electrum servers, Apple Push Notification service, and Bugsnag process information as needed to provide the functions described above, under their respective terms and privacy policies. PurityWallet may link to third-party services and websites that have their own privacy practices.

## Your choices and deletion

You can remove wallets and app data from PurityWallet or uninstall the app. You can turn off notifications or remove individual payment subscriptions from the app. These actions do not delete information that has already been received by a third-party service. Contact the project through the [PurityWallet GitHub repository](https://github.com/PurityWallet/PurityWallet) for privacy questions or requests related to this policy.

## Changes

This policy may be updated when the app's data practices change. The effective date above indicates the latest revision.
