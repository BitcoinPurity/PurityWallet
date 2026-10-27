# TASK-010: GitHub organization migration

Status: Complete

Requirement: REQ-001

## Scope

- Use `PurityWallet/PurityWallet` for the app About link, root npm repository metadata, README repository badges and checkout instructions, and local origin remote.
- Preserve upstream historical references and application identities.

## Verification

- GitHub repository metadata confirms owner `PurityWallet` with type `Organization` and default branch `master`.
- Before the source update, the existing branding suite failed its updated About-link assertion (one failed, six passed).
- After the update, the branding suite passed all seven tests. Repository metadata/origin/README checks and `git diff --check` passed.
- Source and local Git configuration were updated; existing APK artifacts were not rebuilt for this URL change.
