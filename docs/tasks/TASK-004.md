# TASK-004: Temporarily hide Lightning UI entry points

Status: Complete

## Scope

- Add one disabled Lightning UI feature flag.
- Hide Lightning and Ark creation choices from Add Wallet and its advanced wallet-type menu.
- Hide Lightning settings from Network settings.
- Preserve underlying Lightning code and persisted wallet compatibility.

## Verification

- The regression test covers the disabled flag, route-parameter fallback, Add Wallet choices, the advanced type menu, and Network settings.
- The focused feature and branding suites pass with 7 tests; TypeScript validation, focused ESLint, and `git diff --check` pass.
