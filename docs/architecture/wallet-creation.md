# Wallet creation

`AddWalletRoot` continues to open the upstream `AddWallet` screen with its existing wallet-type state and optional route parameters. `isWalletTypeSelectionEnabled` hides the type buttons and the matching header-menu action. Because the unchanged initial state is on-chain with index `0`, the visible flow creates `HDSegwitBech32Wallet`.

Alternative wallet constructors, route parameters, and multisig screens remain intact. Re-enabling the presentation flag restores the upstream selector without reconstructing deleted functionality.
