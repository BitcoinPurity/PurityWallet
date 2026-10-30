# TASK-023: Remove Android and iOS release signing from CI

Status: Complete (source and local validation; hosted native builds not rerun)

Requirement: REQ-019 (updates CI behavior in REQ-011 / TASK-013)

## Scope

- Preserve release-build triggers and timestamp-based build numbers.
- Build/upload an unsigned Android APK without keystore credentials or signing commands.
- Build/upload an unsigned iOS device archive without Apple signing credentials, provisioning, IPA export, or TestFlight upload.
- Keep local/manual signed-release tools and native PR E2E checks unchanged.

## Verification

- First reproduce the credential/signing dependency in workflow regression tests.
- Execute the workflow build scripts with stubbed Gradle/Xcode commands to verify artifact paths, disabled signing, version progression, and failure propagation without credentials.
- Validate workflow YAML/expressions, embedded shell syntax, and relevant tests.
- Actual hosted native builds remain distinct from local workflow-script verification.

## Results

- All six regression cases failed before implementation and passed after the workflow changes. The tests run the actual YAML build scripts with stubbed Gradle/Xcode binaries and no signing credentials, covering artifact contents/paths, build-number progression, signing-disable flags, and propagation of build failures through log pipelines.
- Both release workflows passed pinned Docker actionlint validation (`sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`); all 20 embedded shell scripts passed `bash -n`. Actionlint's optional ShellCheck/Pyflakes integrations were disabled.
- Full lint/TypeScript/localization/metadata checks passed with only three existing unrelated formatting warnings. `git diff --check` passed.
- CI/E2E workflows, Fastlane's local/manual signing lanes, Android Gradle source, and the Apple project signing configuration are unchanged. The obsolete signed-APK BrowserStack consumer and automatic TestFlight publishing job are removed from the release workflows.
- No production credentials were created or changed. No native app was built or published, and no GitHub workflow was dispatched during local verification.
