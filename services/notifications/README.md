# BitcoinPurity payment notifications

Target: `ubuntu@node1`, endpoint: `https://notifications.bitcoinpurity.org`.

This deployment consumes unchanged upstream source from `https://github.com/BlueWallet/GroundControl`, pinned to commit `524de8c0df3e1f1fec8671ad2baef8b1c384038f`. Install the locked dependencies with lifecycle scripts disabled and verify no tracked upstream source changed.

## Apple identity integration

The source now targets `au.com.bitcoininstitute.puritywallet`, matching the app and extension identities in master. Earlier node1/TestFlight delivery evidence used `org.bitcoinpurity.puritywallet`. This source update does not migrate the deployed service, Apple app records, signing profiles, or topic-specific APNs credentials. Configure and verify matching Apple assets and actual-device delivery before distributing the new identity; an old topic configuration is rejected at startup.

## Processes and credentials

Five systemd instances run the API, gateway, block processor, mempool processor, and sender. They use dynamic service users and local MariaDB. Only the gateway is reverse proxied by Nginx. The upstream API and chain workers are restricted to loopback networking.

Systemd loads root-only files under `/etc/puritywallet-notifications` as private per-unit credentials:

| Credential | Consumers                                   |
| ---------- | ------------------------------------------- |
| `db-url`   | API, chain workers, sender                  |
| `rpc-url`  | Block and mempool workers                   |
| `apns-key` | Sender only                                 |
| `fcm-key`  | Sender only, if Android delivery is enabled |

`config.env` holds only non-secret topic, team, key ID, and provider selection. The production APNs topic is `au.com.bitcoininstitute.puritywallet`. Upstream's API checks provider variables during startup but only queues notifications; explicit non-secret sentinels keep signing keys confined to the sender. In iOS-only mode, the unused Google provider receives empty JSON and the gateway rejects Android requests. The project-owned startup adapter skips upstream's eager Google credential lookup and blocks FCM delivery in this mode, without editing upstream files. Android delivery requires a matching BitcoinPurity Firebase service account and the extra sender credential drop-in.

The gateway preserves registration, preference, and unsubscribe bodies. It bounds request sizes and subscription batches, validates push identities, hides internal delivery statistics, and allows only the client's fixed test message through `/enqueue`. Lightning callbacks and administrative/broadcast routes are not public.

## Node integration

Use a local RPC identity named `puritywallet_notifications`, restricted to `getblockchaininfo`, `getblockcount`, `getblockhash`, `getblock`, `getrawmempool`, and `getrawtransaction`. Do not reuse the monitoring or administrator credential. Verify the Purity activation block at height 961637 before starting workers. This backend observes the mainnet daemon, not the separate Signet service.

Adding the RPC identity requires a backed-up node configuration and one controlled restart of `bitcoind.service`. Preserve existing users' whitelist behavior and verify node recovery before starting the notification workers.

## Deployment and release gate

Prepared files are not evidence of a live deployment. Install MariaDB bound to loopback, with a separate database and user. Place the pinned upstream source at `/opt/puritywallet-notifications/upstream` and these files at `/opt/puritywallet-notifications/deployment`. Install the unit template and role-specific drop-ins. Start the API and verify schema/readiness before starting the gateway and workers.

Configure DNS and obtain the certificate through the ACME webroot. `nginx-http.conf` is only for certificate bootstrap; activate `nginx.conf` after certificate issuance. Node1 previously stopped Nginx through global Certbot hooks, which breaks webroot validation. Those hooks are now scoped to its existing standalone Electrum certificate; private backups are under `/etc/puritywallet-notifications/certbot-backup`. Validate systemd and Nginx configuration before activation or reload. Verify API compatibility, chain progress, provider authentication, and actual APNs delivery. Publish the updated privacy policy and rebuild the client before App Store submission.

Node's default HTTP agent timeout interrupted large local RPC batches. The startup adapter uses a 120-second timeout; verify that the mempool worker completes its initial scan and subsequent polling cycles without errors.

The 512 MiB service memory limit gives Node a small default V8 heap. Workers explicitly allow 320 MiB of old-space after the mempool worker exhausted that default heap during sustained polling. The gateway uses 64 MiB old-space within its separate 128 MiB service limit. Check restart counts and memory peaks after deployment.

The pinned cache keeps a dormant `Map` iterator while repeated cache hits delete and reinsert keys. A real-upstream stress probe retained roughly 61 MiB after 100 rounds over 17,000 keys. The project-owned runtime adapter periodically refreshes that iterator, preserving cache contents and LRU eviction order while releasing obsolete Map tables. Upstream source is unchanged. The regression checks both eviction and retained heap; keep it enabled when changing the pin or adapter.

Application journals use a separate volatile namespace limited to seven days and 50 MiB. Nginx logs expire after seven days. Upstream stores device identities, subscriptions, queues, and delivery logs; its database deletion behavior remains unchanged. Uninstalling the wallet does not unsubscribe server records.

## Dependency review

The pinned upstream production dependency audit reports 16 advisories (6 high, 9 moderate, 1 low). Its source and lockfile remain unchanged. The public gateway rejects encoded bodies, bounds JSON input, and does not forward authorization or upgrade headers. This avoids exposing the affected body-parser compression and WebSocket paths to public input. Workers use only local HTTP RPC; no upstream WebSocket server is published. APNs JWT signing uses the fixed ES256 key configuration. These controls reduce exposure; they do not remove the dependency advisories. Review upstream updates before future releases.

## Local verification

Run `GROUND_CONTROL_SOURCE=/path/to/pinned/upstream node --test services/notifications/test/*.test.mjs` and the client's notification-service Jest tests. The cache regression loads the real pinned TypeScript class and is skipped if that environment variable is absent. These tests need no real credentials.
