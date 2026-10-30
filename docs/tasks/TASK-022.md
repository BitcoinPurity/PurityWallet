# TASK-022: Deploy BitcoinPurity payment notifications

Status: In progress

Requirement: REQ-018

Renumbered from the local TASK-009 to preserve the remote Coinbase task. Source configuration now requires APNs topic `au.com.bitcoininstitute.puritywallet` under REQ-016. The October 25 deployment and TestFlight evidence below uses the prior topic `org.bitcoinpurity.puritywallet`. Matching Apple app records, profiles, credentials, and real-device delivery for the new identity remain release prerequisites; this integration does not modify deployed services.

## Scope

- Deploy a compatible backend to `ubuntu@node1` at `https://notifications.bitcoinpurity.org`.
- Move client notification registration away from BlueWallet services; disable the separate Ark push endpoint until a BitcoinPurity equivalent exists.
- Keep upstream dependency source unchanged and place deployment configuration in this project.
- Configure Purity mainnet observation and PurityWallet-owned delivery credentials.
- Ship iOS remote notifications only; hide Android remote push settings and reject saved Android token reuse.
- Update the privacy policy after verifying deployed collection and retention behavior.
- Rebuild and submit iOS only after backend verification.

## Verification

- Test registration, unsubscribe, preferences, and test-push request destinations before changing the client configuration.
- Verify backend startup, API compatibility, HTTPS, node synchronization, and APNs delivery.
- Inspect final IPA signatures, Bundle IDs, App Group, and production push entitlement before upload.

## October 30 source integration verification

- Master fast-forwarded to origin/master `942fac6e030502fb06883823bfd559ae6c032e17`; all original local changes were backed up before integration. The backup stash remains available.
- Apple Bundle IDs/App Group follow TASK-019 / REQ-016, and public version remains 1.1.0. Notification startup validation and the example configuration require the matching new APNs topic; the regression rejects the prior topic.
- Eighteen focused Jest suites passed 289 tests, covering notification destinations, Android remote-push disabling, all 71 notification disclosure paths, Apple identity/Android preference continuity, replay checks, Coinbase spendability, and Send/Coin Control behavior.
- All 12 notification backend tests and 4 host-configuration tests passed. The cache/eviction regression ran against unchanged upstream commit `524de8c0df3e1f1fec8671ad2baef8b1c384038f`, with no skipped cases in the completed checks.
- Full lint and TypeScript checks passed with three existing unrelated formatting warnings. Apple project/plist/entitlement validation, Swift parsing, Fastlane/Podfile Ruby syntax, and `git diff --check` passed.
- No signed Apple build, new app record, provisioning registration, production deployment, or real-device push test was performed during this integration. The older release evidence below does not verify delivery under the new topic.

## Deployment evidence (October 25, 2026)

- Pinned upstream and the project-owned adapter are installed on node1, with MariaDB bound to loopback and systemd private credentials.
- Mainnet RPC is restricted to six read methods. Main node restart recovered at height 970718; the existing monitor and Electrum TLS checks passed. A mutation probe returned HTTP 403.
- Public DNS points to node1; HTTPS readiness and the notification certificate renewal dry-run passed. Global stop/start hooks were scoped to the existing standalone Electrum certificate so webroot renewal stays available.
- The local HTTP agent timeout was raised to 120 seconds after reproducing failed 100-transaction RPC batches. The same batch succeeded and subsequent mempool cycles completed without connection resets.
- Local checks: 10 backend tests, 4 host-configuration tests, and 22 client notification tests passed. Upstream tests previously passed 89/89. Upstream production dependency audit still contains 16 advisories, including 6 high; gateway restrictions mitigate public exposure but do not remove advisories.
- The topic-specific production APNs key is deployed as a root-only systemd credential. A synthetic notification traversed the queue/sender and received Apple's HTTP 400 `BadDeviceToken`, as expected for the generated token. This proves a provider response, not real-device delivery.
- The user confirmed the six App Store privacy data categories; App Store Connect now shows the privacy responses as Published. The revised public privacy policy was published at commit `dca1d9d6d567f5c2a816a7ecc94784cb9a3cbbc2` and matches this service's operator and retention behavior.
- Signed iOS build `1.0.0 (1)` was rebuilt, uploaded, and installed through TestFlight. Actual-device push receipt is verified below; formal App Review remains pending organization enrollment; the privacy notice correction is covered by build 2 below.
- Sustained polling exposed V8 default-heap exhaustion and automatic worker restarts under the 512 MiB service limit. Explicit worker old-space is now 320 MiB (gateway 64 MiB); stability must be rechecked after that deployment before considering the backend release-ready.
- The real upstream cache stress test then reproduced approximately 61 MiB retained growth after 100 hit-only rounds over 17,000 keys. A project-owned runtime adapter refreshes the dormant Map iterator without changing upstream source or LRU eviction order. The regression now passes, including iOS-only provider isolation; 12 backend tests pass with the pinned source configured.

- After deploying the cache adapter, the mempool worker completed 71 polling cycles over 666 seconds with zero error markers and zero restarts. Current charged memory was approximately 104 MB, below the startup peak of approximately 314 MB. All 47 pinned upstream source files still matched their original hashes.

- Resolved in the disclosure correction below: the old locale footnotes promised deletion when delivery was disabled, contrary to the verified backend behavior and published policy. The corrected notices distinguish opt-out from deletion.

- Real-device test (October 25, 2026): initially no fresh registration was present. After the tester reopened the in-app notification switch, the genuine iOS `PurityWallet 1.0.0` configuration reached the backend with delivery enabled. One test push was queued through the public HTTPS endpoint; the sender recorded Apple HTTP 200 and success. The tester explicitly confirmed receipt of `Test push notification` on the iPhone. No device token or wallet information was requested in chat.

## Notification disclosure correction

- User approved complete English, Simplified Chinese, and Traditional Chinese text with existing English fallback for all other locales. Removed the 68 obsolete translated notices; notification APIs and backend retention are unchanged.
- The notice now names the BitcoinPurity service, describes collected information, distinguishes opt-out/uninstall from deletion, and explains approximately 3-day delivery records, 7-day operational logs, startup cleanup of transaction-ID subscriptions older than approximately 90 days, and continued address/preferences retention.
- All 71 shipped locale paths were exercised through the actual localization library: 3 maintained notices and 68 English fallbacks passed.
- Target build: `1.0.0 (2)`. Signed rebuild, IPA inspection, upload, and TestFlight processing completed for this correction.

- Build `1.0.0 (2)` archive/export succeeded. Final IPA inspection found all three corrected notices, all target build numbers equal to 2, valid signatures, the production push entitlement, and the PurityWallet app group. Artifact: `build/ios/PurityWallet-1.0.0-2.ipa`; SHA-256: `ed959f2f20685deea459ccbb1f99ec1f3798c1a15729b6f2f010485f569f5444`. Upload succeeded and Apple processing completed; the existing internal group shows build `1.0.0 (2)` as Testing.

- Disclosure correction complete: TestFlight build ID `23884b85-35eb-4276-b6ac-98081e4bcc6a` is Testing in `PurityWallet Internal` (1 tester, 2 builds). The existing three missing-dSYM warnings for vendor-prebuilt React, ReactNativeDependencies, and Hermes frameworks remain. Notification behavior and server retention were not changed.
