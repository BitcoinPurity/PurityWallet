import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('PurityWallet feature visibility', () => {
  it('temporarily hides Lightning UI entry points behind one disabled flag', () => {
    const features = read('blue_modules/features.ts');
    const addWallet = read('screen/wallets/Add.tsx');
    const addWalletStack = read('navigation/AddWalletStack.tsx');
    const networkSettings = read('screen/settings/NetworkSettings.tsx');

    expect(features).toContain('export const isLightningUiEnabled = false');
    expect(addWallet).toContain('isLightningUiEnabled && routeSelectedWalletType === Chain.OFFCHAIN');
    expect(addWallet).toContain('isLightningUiEnabled && routeSelectedWalletType === ButtonSelected.ARK');
    expect(addWallet).toContain('isLightningUiEnabled && backdoorPressed >= 20');
    expect(addWallet).toContain('isLightningUiEnabled && (selectedWalletType === ButtonSelected.OFFCHAIN || hasStoredLndHub)');
    expect(addWalletStack).toContain('...(isLightningUiEnabled');
    expect(networkSettings).toContain('{isLightningUiEnabled && (');
  });
});
