# TASK-006: Use an independent Android application identity

Status: Android identity retained by TASK-020; Apple identity updated by TASK-019

The initial Android-only identity below is historical. TASK-020 restores this Android identity for existing APK upgrades; TASK-019 defines the Apple identity.

## Scope

- Publish Android PurityWallet as `org.bitcoinpurity.puritywallet` so it can coexist with BlueWallet.
- Align Android native code packages, React Native codegen metadata, Firebase package metadata, and install/test scripts.
- Keep iOS/macOS identifiers, shared storage key strings, protocols, and wallet formats unchanged.
- Document that existing BlueWallet data requires backup/import rather than automatic migration.

## Verification

- The branding regression suite asserts the Android namespace, application ID, Firebase package entry, codegen package, install scripts, and new Play listing URL.
- Android Release manifest/package inspection and a signed APK installation are required after the package rename.
- The checked-in Firebase package selector matches the new identity; a Firebase-generated Android client configuration for the new package remains required before production release.
