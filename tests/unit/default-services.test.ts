import fs from 'fs';
import path from 'path';

import { suggestedServers } from '../../blue_modules/BlueElectrum';
import { BLOCK_EXPLORERS, getBlockExplorersList } from '../../models/blockExplorer';

const projectRoot = path.resolve(__dirname, '../..');
const read = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('Purity service defaults', () => {
  it('exposes only the Purity Electrum server to the JavaScript client', () => {
    expect(suggestedServers).toEqual([{ host: 'electrum.bitcoinpurity.org', ssl: 50002 }]);
  });

  it('uses only the Purity Electrum server in native clients', () => {
    const nativeDefaults = [
      read('ios/Shared/UserDefaultsGroup.swift'),
      read('android/app/src/main/java/io/bluewallet/bluewallet/ElectrumClient.kt'),
      read('android/app/src/main/java/io/bluewallet/bluewallet/MarketWidget.kt'),
    ];

    for (const source of nativeDefaults) {
      expect(source).toContain('electrum.bitcoinpurity.org');
      expect(source).toContain('50002');
      expect(source).not.toMatch(/electrum[123]\.bluewallet\.io|mainnet\.foundationdevices\.com|electrum\.acinq\.co|electrum\.bitaroo\.net/);
    }
  });

  it('offers only the Purity explorer and custom URL entry', () => {
    expect(BLOCK_EXPLORERS).toEqual({
      default: { key: 'default', name: 'Mempool Bitcoin Purity', url: 'https://mempool.bitcoinpurity.org' },
      custom: { key: 'custom', name: 'Custom', url: '' },
    });
    expect(getBlockExplorersList()).toEqual([BLOCK_EXPLORERS.default, BLOCK_EXPLORERS.custom]);
  });
});

