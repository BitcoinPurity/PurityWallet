# TASK-004: Temporarily hide Lightning UI entry points

Status: Complete

## Scope

- Add one disabled Lightning UI feature flag.
- Hide Lightning and Ark creation choices from Add Wallet and its advanced wallet-type menu. TASK-007 subsequently hides the complete wallet-type selector while preserving its implementation.
- Hide Lightning settings from Network settings.
- Preserve underlying Lightning code and persisted wallet compatibility.

## Verification

- The regression tests cover the disabled flags, hidden Add Wallet selectors, retained creation paths, and the gated Network settings entry.
- The focused feature and branding suites pass with 7 tests; TypeScript validation, focused ESLint, and `git diff --check` pass.
