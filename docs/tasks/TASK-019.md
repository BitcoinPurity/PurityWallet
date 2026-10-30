# TASK-019: Unified application identity

Status: Complete; Android identity changes superseded by TASK-020

Requirement: REQ-016 (updates REQ-001 and REQ-005)

## Scope

- Use `au.com.bitcoininstitute.puritywallet` for Android application ID/native namespace and the Apple main app Bundle ID.
- Retain `.Stickers`/`.MarketWidget` extension suffixes and align shared preferences/App Group to `group.au.com.bitcoininstitute.puritywallet`.
- Update native/codegen references, local Firebase package selector, signing/export metadata, task/activity identifiers, install scripts, and store links.
- Retain native project/target/module names, URL schemes, wallet formats, existing installations/data, and GitHub organization.
- Build and install the complete Android app under its new identity in the local emulator.

## Verification

- The updated identity assertion in the existing branding suite failed before implementation (one failed, six passed).
- New Apple distribution profiles/App Group registration and Firebase-generated configuration are external release prerequisites; this task does not register or publish them.
- Four focused Jest suites passed all 18 tests, including shared preference namespace agreement and settings/currency behavior.
- `npm run lint` passed. Formatting in the changed identity test was corrected, and targeted ESLint checks for all changed JavaScript/TypeScript files passed; unrelated existing test formatting warnings remain.
- Six Apple Bundle ID settings, all three App Group entitlement sets, native/JavaScript shared group consumers, activity/background task identifiers, and export profile mappings passed consistency checks. The pre-existing `com.transistorsoft.fetch` background task ID is retained.
- Apple project/plist/entitlement syntax and Fastlane Ruby syntax checks passed. No signed Apple binary was produced.
- Android ARM64 Release build succeeded; APK v2 signature and 16 KiB alignment passed. Package and launch activity resolve to `au.com.bitcoininstitute.puritywallet` at version `1.1.0`.
- APK inspection confirmed new native/codegen class namespaces, the matching shared preference group, the current GitHub About link, and the full-wallet bundle without demo transaction stubs.
- The APK installed and cold-launched successfully in the existing emulator. The old `org.bitcoinpurity.puritywallet` package remains installed. No startup crash appeared in AndroidRuntime/ReactNativeJS error logs.
- `git diff --check` passed. Production Firebase configuration and Apple signing/App Group registration remain external release prerequisites.
