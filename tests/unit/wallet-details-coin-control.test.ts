import { getCoinControlStats } from '../../screen/wallets/WalletDetails';
import { LegacyWallet } from '../../class/wallets/legacy-wallet';

jest.mock('react-native-image-picker', () => ({ launchCamera: jest.fn(), launchImageLibrary: jest.fn() }));

const reward = { txid: 'aa'.repeat(32), vout: 0, value: 100000, address: 'address', height: 971138, isCoinbase: true };
const ordinary = { txid: 'bb'.repeat(32), vout: 0, value: 100000, address: 'address', height: 971000, isCoinbase: false };

describe('Wallet Details Coin Control entry', () => {
  it('counts an immature-only wallet so Coin Control remains accessible', () => {
    const wallet = new LegacyWallet();
    wallet._utxo = [reward];
    expect(wallet.getUtxo()).toHaveLength(0);
    expect(getCoinControlStats(wallet)).toEqual({ hasCoinControl: true, utxoCount: 1 });
  });

  it('counts all owned outputs including immature, unknown and frozen outputs', () => {
    const wallet = new LegacyWallet();
    wallet._utxo = [reward, ordinary, { ...ordinary, txid: 'cc'.repeat(32), isCoinbase: undefined }];
    wallet.setUTXOMetadata(ordinary.txid, ordinary.vout, { frozen: true });
    expect(getCoinControlStats(wallet)).toEqual({ hasCoinControl: true, utxoCount: 3 });
  });

  it('retains the empty-wallet count', () => {
    expect(getCoinControlStats(new LegacyWallet())).toEqual({ hasCoinControl: true, utxoCount: 0 });
  });
});
