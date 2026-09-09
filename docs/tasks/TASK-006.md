# TASK-006: Use an independent Android application identity

Status: In progress

## Scope

- Publish Android PurityWallet as `org.bitcoinpurity.puritywallet` so it can coexist with BlueWallet.
- Align Android native code packages, React Native codegen metadata, Firebase package metadata, and install/test scripts.
- Keep iOS/macOS identifiers, shared storage key strings, protocols, and wallet formats unchanged.
- Document that existing BlueWallet data requires backup/import rather than automatic migration.

## Verification

- The branding regression suite asserts the Android namespace, application ID, Firebase package entry, codegen package, install scripts, and new Play listing URL.
- Android Release manifest/package inspection and a signed APK installation are required after the package rename.
- The checked-in Firebase package selector matches the new identity; a Firebase-generated Android client configuration for the new package remains required before production release.
