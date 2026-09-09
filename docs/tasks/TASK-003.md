# TASK-003: Route Donate to the on-chain Send flow

Status: Complete

## Scope

- Remove the external BlueWallet donation-page handoff.
- Select a send-capable on-chain wallet and open the standard Send screen.
- Prefill one centralized, replaceable donation-recipient parameter without presetting an amount.
- Use an intentionally invalid placeholder until the official recipient is provided.

## Verification

- The regression test covers the configured recipient, internal wallet selector, Send route, and removal of the legacy external URL.
- The focused branding suite passes with 6 tests, TypeScript validation passes, and `git diff --check` reports no errors.
