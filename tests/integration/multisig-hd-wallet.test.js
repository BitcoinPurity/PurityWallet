import assert from 'assert';

import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { MultisigHDWallet } from '../../class/wallets/multisig-hd-wallet';

jest.setTimeout(300 * 1000);

afterAll(() => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  if (!(await BlueElectrum.ensureConnected())) {
    throw new Error('failed to connect to Electrum');
  }
});

describe('multisig-hd-wallet', () => {
  it('can fetch balance & transactions', async () => {
    const path = "m/48'/0'/0'/2'";
    const fp1 = 'D37EAD88';
    const fp2 = '168DD603';
    const Zpub1 = 'Zpub74ijpfhERJNjhCKXRspTdLJV5eoEmSRZdHqDvp9kVtdVEyiXk7pXxRbfZzQvsDFpfDHEHVtVpx4Dz9DGUWGn2Xk5zG5u45QTMsYS2vjohNQ';
    const Zpub2 = 'Zpub75mAE8EjyxSzoyPmGnd5E6MyD7ALGNndruWv52xpzimZQKukwvEfXTHqmH8nbbc6ccP5t2aM3mws3pKYSnKpKMMytdbNEZFUxKzztYFM8Pn';

    const w = new MultisigHDWallet();
    w.addCosigner(Zpub1, fp1);
    w.addCosigner(Zpub2, fp2);
    w.setDerivationPath(path);
    w.setM(2);

    assert.strictEqual(w.getM(), 2);
    assert.strictEqual(w.getN(), 2);
    assert.strictEqual(w.getDerivationPath(), path);
    assert.strictEqual(w.getCosigner(1), Zpub1);
    assert.strictEqual(w.getCosigner(2), Zpub2);
    assert.strictEqual(w.getCosignerForFingerprint(fp1), Zpub1);
    assert.strictEqual(w.getCosignerForFingerprint(fp2), Zpub2);

    await w.fetchBalance();
    await w.fetchTransactions();
    const transactions = w.getTransactions();
    assert.ok(transactions.length >= 6);
    assert.strictEqual(
      transactions.find(tx => tx.txid === '98250695c4041a936a0da1d7a39c5e252275bbe3865d6b0ee6754763b36490ca')?.value,
      108880,
    );
    assert.ok(transactions.some(tx => tx.value < 0));

    // Include pending incoming value so both sides represent the full transaction-history net.
    const balanceIncludingUnconfirmed = w.getBalance() + Math.max(w.getUnconfirmedBalance(), 0);
    assert.strictEqual(
      balanceIncludingUnconfirmed,
      transactions.reduce((balance, tx) => balance + tx.value, 0),
    );
  });
});
