# TASK-007: Create only a standard Bitcoin wallet

Status: Complete

## Scope

- Hide wallet-type selection on the Add Wallet screen and in the header menu behind one disabled presentation flag.
- Keep the upstream default on-chain/index `0` behavior, which creates a native SegWit Bitcoin wallet.
- Preserve all alternative constructors, route parameters, multisig screens, optional entropy, wallet naming, backup, import, and existing-wallet compatibility.

## Verification

- The regression test checks the disabled selector flag, hidden UI controls, unchanged native SegWit default, and retained alternative creation paths.
- Focused Jest, TypeScript, ESLint, and `git diff --check` must pass.
