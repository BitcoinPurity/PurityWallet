# Legacy-chain replay checks

`blue_modules/legacy-chain.ts` queries Bitcoin mainnet at `https://mempool.space/api`, independently of the Purity Electrum connection. Requests are grouped by transaction ID, bounded in concurrency, and time out. `GET /tx/:txid` supplies output value/script and `GET /tx/:txid/outspends` supplies current spent status. Only an explicit transaction 404 is absence; network errors, throttling, invalid payloads, and timeouts are unknown.

The check returns per-outpoint `shared`, `absent`, or `unknown` status. Matching requires the same transaction ID, output index, satoshi value, locking script derived from the wallet's address, and `spent: false`. There is no persisted result cache. UI checks discard obsolete asynchronous results after an input/wallet change or unmount.

Coin Control checks its complete UTXO list, including frozen outputs. Send checks manually selected inputs for its inline status and freshly checks the actual coin-selection result before calling the existing signing operation. Risk acknowledgement is awaited before signing; failure or cancellation stops the attempt. No wallet keys, serialization formats, transaction format, or dependencies change.
