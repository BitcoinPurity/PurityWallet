import * as bitcoin from 'bitcoinjs-lib';
import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { getCoinbaseStatus, isUtxoSpendable } from '../../class/utxo-spendability';
import { LegacyWallet } from '../../class/wallets/legacy-wallet';
import { SegwitBech32Wallet } from '../../class/wallets/segwit-bech32-wallet';
import { SegwitP2SHWallet } from '../../class/wallets/segwit-p2sh-wallet';
import { TaprootWallet } from '../../class/wallets/taproot-wallet';
import { HDSegwitBech32Wallet } from '../../class/wallets/hd-segwit-bech32-wallet';
import { HDTaprootWallet } from '../../class/wallets/hd-taproot-wallet';
import { HDLegacyP2PKHWallet } from '../../class/wallets/hd-legacy-p2pkh-wallet';
import { WatchOnlyWallet } from '../../class/wallets/watch-only-wallet';
import { MultisigHDWallet } from '../../class/wallets/multisig-hd-wallet';

function creatingTransaction(coinbase: boolean, witness = false) {
  const tx = new bitcoin.Transaction();
  tx.addInput(new Uint8Array(32).fill(coinbase ? 0 : 1), coinbase ? 0xffffffff : 0, undefined, new Uint8Array([1, 1]));
  tx.addOutput(new Uint8Array([bitcoin.opcodes.OP_TRUE]), 100000n);
  if (witness) tx.setWitness(0, [new Uint8Array(32)]);
  return { txid: tx.getId(), txhex: tx.toHex() };
}

describe('UTXO spendability', () => {
  it.each([false, true])('parses legacy/SegWit creating transactions (witness=%s) and reuses classification', witness => {
    for (const coinbase of [false, true]) {
      const utxo = creatingTransaction(coinbase, witness);
      expect(getCoinbaseStatus(utxo)).toBe(coinbase);
      expect(getCoinbaseStatus({ txid: utxo.txid })).toBe(coinbase);
    }
  });

  it('keeps missing, malformed and mismatched raw transactions unknown', () => {
    const txid = 'ff'.repeat(32);
    expect(getCoinbaseStatus({ txid })).toBeUndefined();
    expect(getCoinbaseStatus({ txid, txhex: 'broken' })).toBeUndefined();
    expect(getCoinbaseStatus({ txid, txhex: creatingTransaction(false).txhex })).toBeUndefined();
    expect(getCoinbaseStatus({ txid })).toBeUndefined();
  });

  it.each([1, 50, 99, 100, 101, 150])('uses the consensus boundary at %s confirmations', confirmations => {
    expect(isUtxoSpendable({ isCoinbase: true, height: 1001 - confirmations }, 1000)).toBe(confirmations >= 100);
  });

  it('preserves ordinary confirmed/unconfirmed spending without requiring a tip', () => {
    expect(isUtxoSpendable({ isCoinbase: false, height: 1000 }, null)).toBe(true);
    expect(isUtxoSpendable({ isCoinbase: false, height: 0 }, null)).toBe(true);
    expect(isUtxoSpendable({ isCoinbase: false, height: -1 }, null)).toBe(true);
    expect(isUtxoSpendable({ isCoinbase: false }, 1000, { frozen: true })).toBe(false);
  });

  it('rejects unknown status, missing/invalid heights and tip rollback', () => {
    expect(isUtxoSpendable({ height: 1 }, 1000)).toBe(false);
    for (const tip of [null, undefined, NaN, Infinity, -1, 1000.5]) {
      expect(isUtxoSpendable({ isCoinbase: true, height: 901 }, tip)).toBe(false);
    }
    for (const height of [undefined, 0, -1, NaN, 1001]) {
      expect(isUtxoSpendable({ isCoinbase: true, height }, 1000)).toBe(false);
    }
    expect(isUtxoSpendable({ isCoinbase: true, height: 901 }, 1000)).toBe(true);
    expect(isUtxoSpendable({ isCoinbase: true, height: 901 }, 999)).toBe(false);
  });
});

describe('shared transaction-construction guard', () => {
  const address = 'bc1quuafy8htjjj263cvpj7md84magzmc8svmh8lrm';
  const utxos = [
    {
      txid: '11'.repeat(32),
      vout: 0,
      value: 100000,
      address,
      isCoinbase: true,
      height: 902,
    },
    {
      txid: '22'.repeat(32),
      vout: 0,
      value: 100000,
      address,
      isCoinbase: true,
      height: 901,
    },
    {
      txid: '33'.repeat(32),
      vout: 0,
      value: 100000,
      address,
      isCoinbase: false,
      height: 1000,
    },
    {
      txid: '44'.repeat(32),
      vout: 0,
      value: 100000,
      address,
      isCoinbase: false,
      height: 0,
    },
  ];

  beforeEach(() => {
    jest.spyOn(BlueElectrum, 'getSpendabilityTip').mockReturnValue(1000);
    jest.spyOn(BlueElectrum, 'getSpendabilityHeight').mockImplementation(txid => utxos.find(u => u.txid === txid)?.height);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each(
    [LegacyWallet, SegwitBech32Wallet, SegwitP2SHWallet, TaprootWallet, HDSegwitBech32Wallet, HDTaprootWallet, HDLegacyP2PKHWallet].map(
      Wallet => [Wallet.name, Wallet] as const,
    ),
  )('%s excludes immature outputs from selection, Send Max and fee calculation', (_, Wallet) => {
    const wallet = new Wallet();
    const max = wallet.coinselect(utxos, [{ address }], 1);
    expect(max.inputs.map(u => u.txid)).toEqual(utxos.slice(1).map(u => u.txid));
    expect(max.outputs[0].value + max.fee).toBe(300000);
    expect(wallet.coinselect(utxos.slice(1), [{ address }], 1).fee).toBe(max.fee);
    expect(wallet.coinselect(utxos, [{ address, value: 90000 }], 1).inputs.every(u => u.txid !== utxos[0].txid)).toBe(true);
    expect(() => wallet.createTransaction([utxos[0]], [{ address }], 1, address, 0xffffffff, true, 0)).toThrow(/spendable|immature/i);
    expect(() => wallet.coinselect([{ ...utxos[0], isCoinbase: undefined }], [{ address }], 1)).toThrow(/spendable|unknown/i);
  });

  it('multisig forwards its adjusted input sizes to the guarded selector', () => {
    const wallet = new MultisigHDWallet();
    wallet.setM(1);
    wallet.addCosigner('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    expect(() => wallet.createTransaction([utxos[0]], [{ address }], 1, address, 0xffffffff, true, 0)).toThrow(/spendable|immature/i);
  });

  it('signs a mature Coinbase and rejects the same cached raw input after rollback or metadata removal', () => {
    const wallet = new SegwitBech32Wallet();
    wallet.setSecret('L4ccWrPMmFDZw4kzAKFqJNxgHANjdy6b7YKNXMwB4xac4FLF3Tov');
    const coinbase = new bitcoin.Transaction();
    coinbase.addInput(new Uint8Array(32), 0xffffffff, undefined, new Uint8Array([1, 1]));
    coinbase.addOutput(bitcoin.address.toOutputScript(String(wallet.getAddress())), 100000n);
    const input = { txid: coinbase.getId(), txhex: coinbase.toHex(), vout: 0, value: 100000 };
    jest.mocked(BlueElectrum.getSpendabilityHeight).mockReturnValue(901);
    const result = wallet.createTransaction([input], [{ address }], 1, address, 0xffffffff, false, 0);
    expect(result.tx?.ins).toHaveLength(1);
    expect(result.tx?.ins[0].witness).toHaveLength(2);
    jest.mocked(BlueElectrum.getSpendabilityTip).mockReturnValue(999);
    expect(() => wallet.createTransaction([{ ...input, txhex: undefined }], [{ address }], 1, address, 0xffffffff, false, 0)).toThrow(
      /spendable/i,
    );
  });

  it('guards watch-only hardware PSBT construction through HD delegation', () => {
    const wallet = new WatchOnlyWallet();
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    wallet.setSecret(hd.getXpub());
    wallet.init();
    expect(() => wallet.createTransaction([utxos[0]], [{ address }], 1, address)).toThrow(/spendable|immature/i);
  });

  it('keeps total UTXOs visible and rechecks manual, frozen and stale inputs at construction', () => {
    const wallet = new LegacyWallet();
    wallet._utxo = utxos;
    expect(wallet.getUtxo(true)).toHaveLength(4);
    expect(wallet.getUtxo()).toHaveLength(3);
    wallet._utxo = [utxos[0]];
    expect(() =>
      wallet.coinselect(
        wallet.getUtxo().map(({ wif, ...u }) => u),
        [{ address }],
        1,
      ),
    ).toThrow(/spendable|immature/i);
    wallet._utxo = utxos;
    wallet.setUTXOMetadata(utxos[2].txid, 0, { frozen: true });
    expect(() => wallet.coinselect([utxos[2]], [{ address }], 1)).toThrow(/spendable|frozen/i);
    jest.mocked(BlueElectrum.getSpendabilityTip).mockReturnValue(999);
    expect(() => wallet.coinselect([utxos[1]], [{ address }], 1)).toThrow(/spendable|immature/i);
    jest.mocked(BlueElectrum.getSpendabilityTip).mockReturnValue(null);
    expect(() => wallet.coinselect([utxos[1]], [{ address }], 1)).toThrow(/spendable/i);
    expect(wallet.coinselect([utxos[3]], [{ address }], 1).inputs).toHaveLength(1);
  });
});
