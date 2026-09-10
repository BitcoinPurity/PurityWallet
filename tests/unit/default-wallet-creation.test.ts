import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('default wallet creation', () => {
  it('hides wallet-type selection while preserving the upstream creation paths', () => {
    const features = read('blue_modules/features.ts');
    const addWallet = read('screen/wallets/Add.tsx');
    const addWalletStack = read('navigation/AddWalletStack.tsx');

    expect(features).toContain('export const isWalletTypeSelectionEnabled = false');
    expect(addWallet).toContain('!isWalletTypeSelectionEnabled && styles.hidden');
    expect(addWalletStack).toContain('hidden: !isWalletTypeSelectionEnabled');
    expect(addWallet).toContain('selectedIndex: 0');
    expect(addWallet).toContain('selectedWalletType: ButtonSelected.ONCHAIN');
    expect(addWallet).toContain('new HDSegwitBech32Wallet()');
    expect(addWallet).toContain("navigate('WalletsAddMultisig'");
    expect(addWallet).toContain('new LightningCustodianWallet()');
    expect(addWallet).toContain('new LightningArkWallet()');
    expect(addWalletStack).toContain('selectedWalletType?:');
    expect(addWalletStack).toContain('selectedIndex?: number');
  });
});
