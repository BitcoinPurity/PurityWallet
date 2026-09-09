# TASK-002: Use only Purity network defaults

Status: Complete

## Scope

- Consolidate bundled JavaScript, iOS, and Android Electrum defaults to `electrum.bitcoinpurity.org:50002:s`.
- Consolidate predefined block explorers to `https://mempool.bitcoinpurity.org`.
- Preserve explicit user configuration and storage compatibility.

## Verification

- Regression coverage asserts the exact singleton Electrum and explorer defaults across JavaScript, iOS, and Android.
- Static source checks, localization/metadata validation, XML/plist validation, and `git diff --check` pass.
- DNS, TCP port 50002, TLS certificate verification, and Electrum `server.version` were verified live; the server returned `electrs/0.10.10` with protocol `1.4`.
- `https://mempool.bitcoinpurity.org` was verified reachable.
