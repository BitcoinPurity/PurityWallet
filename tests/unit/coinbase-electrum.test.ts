import * as bitcoin from 'bitcoinjs-lib';
import { EventEmitter } from 'events';
import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { getCoinbaseStatus } from '../../class/utxo-spendability';
import { HDSegwitBech32Transaction } from '../../class/hd-segwit-bech32-transaction';
import { LegacyWallet } from '../../class/wallets/legacy-wallet';
import { HDSegwitBech32Wallet } from '../../class/wallets/hd-segwit-bech32-wallet';
import type { Utxo } from '../../class/wallets/types';

jest.mock('electrum-client', () => jest.fn().mockImplementation(() => (globalThis as any).__coinbaseClient));

const address = 'bc1quuafy8htjjj263cvpj7md84magzmc8svmh8lrm';
let fixtureNumber = 0;
function fixture(coinbase = true, height = 901): Utxo {
  const tx = new bitcoin.Transaction();
  tx.version = ++fixtureNumber;
  tx.addInput(new Uint8Array(32).fill(coinbase ? 0 : 1), coinbase ? 0xffffffff : 0);
  tx.addOutput(bitcoin.address.toOutputScript(address), 100000n);
  return {
    txid: tx.getId(),
    txhex: tx.toHex(),
    vout: 0,
    value: 100000,
    address,
    height,
  };
}

let header: { height: number; hex: string };
let outputs: Utxo[];
let client: any;

beforeEach(async () => {
  BlueElectrum.forceDisconnect();
  await BlueElectrum.setDisabled(false);
  header = { height: 1000, hex: '00'.repeat(80) };
  outputs = [];
  client = {
    subscribe: new EventEmitter(),
    initElectrum: jest.fn().mockResolvedValue(['Fulcrum 1.10.0', '1.4']),
    server_ping: jest.fn().mockResolvedValue(null),
    close: jest.fn(),
    blockchainHeaders_subscribe: jest.fn(async () => ({ ...header })),
    blockchainScripthash_listunspentBatch: jest.fn(async (hashes: string[]) =>
      hashes.map(param => ({
        param,
        result: outputs.map(u => ({
          tx_hash: u.txid,
          tx_pos: u.vout,
          height: u.height,
          value: u.value,
        })),
      })),
    ),
    blockchainScripthash_getHistoryBatch: jest.fn(async (hashes: string[]) =>
      hashes.map(param => ({
        param,
        result: outputs.map(u => ({ tx_hash: u.txid, height: u.height })),
      })),
    ),
    blockchainTransaction_getBatch: jest.fn(async (txids: string[]) =>
      txids.map(param => ({
        param,
        result: outputs.find(u => u.txid === param)?.txhex,
      })),
    ),
  };
  (globalThis as any).__coinbaseClient = client;
  expect(await BlueElectrum.ensureConnected()).toBe(true);
});
afterEach(() => {
  BlueElectrum.forceDisconnect();
  BlueElectrum.setBatchingEnabled();
  jest.restoreAllMocks();
});

async function fetchAndPrepare() {
  const result = await BlueElectrum.multiGetUtxoByAddress([address]);
  await BlueElectrum.prepareUtxos(result[address]);
  return result[address];
}

describe('Coinbase Electrum integration', () => {
  it('classifies standard listunspent responses, deduplicates txids and reuses cache on refresh/reconnect', async () => {
    outputs = [fixture(), fixture(false, 0)];
    outputs.push({ ...outputs[0], vout: 1 });
    const utxos = await fetchAndPrepare();
    expect(utxos.map(u => u.isCoinbase)).toEqual([true, false, true]);
    expect(client.blockchainTransaction_getBatch).toHaveBeenCalledTimes(1);
    expect(client.blockchainTransaction_getBatch.mock.calls[0]).toEqual([[outputs[0].txid, outputs[1].txid], false]);
    await fetchAndPrepare();
    expect(client.blockchainTransaction_getBatch).toHaveBeenCalledTimes(1);
    BlueElectrum.forceDisconnect();
    expect(BlueElectrum.getSpendabilityTip()).toBeNull();
    expect(BlueElectrum.getSpendabilityHeight(outputs[0].txid)).toBeUndefined();
    await BlueElectrum.ensureConnected();
    await fetchAndPrepare();
    expect(client.blockchainTransaction_getBatch).toHaveBeenCalledTimes(1);
  });

  it('reuses raw and verbose transaction cache populated by history fetching', async () => {
    outputs = [fixture(), fixture(false)];
    await BlueElectrum.multiGetTransactionByTxid([outputs[0].txid], false);
    client.blockchainTransaction_getBatch.mockResolvedValueOnce([
      {
        param: outputs[1].txid,
        result: {
          ...BlueElectrum.txhexToElectrumTransaction(outputs[1].txhex!),
          confirmations: 150,
        },
      },
    ]);
    await BlueElectrum.multiGetTransactionByTxid([outputs[1].txid], true);
    client.blockchainTransaction_getBatch.mockClear();
    expect((await fetchAndPrepare()).map(u => u.isCoinbase)).toEqual([true, false]);
    expect(client.blockchainTransaction_getBatch).not.toHaveBeenCalled();
  });

  it('keeps raw transaction responses raw when retrying a response-too-large RPC error', async () => {
    outputs = [fixture(false)];
    client.blockchainTransaction_getBatch.mockResolvedValueOnce([
      { param: outputs[0].txid, error: { code: -32600, message: 'response too large' } },
    ]);
    client.blockchainTransaction_get = jest.fn().mockResolvedValue(outputs[0].txhex);
    const result = await BlueElectrum.multiGetTransactionByTxid([outputs[0].txid], false);
    expect(result[outputs[0].txid]).toBe(outputs[0].txhex);
    expect(getCoinbaseStatus({ txid: outputs[0].txid })).toBe(false);
  });

  it('reuses the existing Realm raw cache, including while disconnected', async () => {
    outputs = [fixture(false)];
    const txids = [outputs[0].txid];
    const raw = await BlueElectrum.multiGetTransactionByTxid(txids, false);
    expect(await BlueElectrum.multiGetTransactionByTxid(txids, false)).toEqual(raw);
    BlueElectrum.forceDisconnect();
    expect(await BlueElectrum.multiGetTransactionByTxid(txids, false)).toEqual(raw);
    expect(client.blockchainTransaction_getBatch).toHaveBeenCalledTimes(1);
  });

  it('preserves unknown outputs on RPC/missing/malformed data, retries, and leaves classified funds usable', async () => {
    outputs = [fixture(), fixture(false), fixture(false)];
    const known = outputs[1];
    getCoinbaseStatus(known);
    client.blockchainTransaction_getBatch.mockRejectedValueOnce(new Error('RPC failed'));
    const utxos = await fetchAndPrepare();
    expect(utxos[0].isCoinbase).toBeUndefined();
    const wallet = new LegacyWallet();
    wallet._utxo = utxos;
    expect(wallet.getUtxo(true)).toHaveLength(3);
    expect(wallet.getUtxo().map(u => u.txid)).toEqual([known.txid]);
    client.blockchainTransaction_getBatch.mockResolvedValueOnce([
      { param: outputs[0].txid, result: 'malformed' },
      {
        param: outputs[2].txid,
        error: { code: -5, message: 'No such transaction' },
      },
    ]);
    await BlueElectrum.prepareUtxos(utxos);
    expect(utxos[0].isCoinbase).toBeUndefined();
    expect(utxos[2].isCoinbase).toBeUndefined();
    await BlueElectrum.prepareUtxos(utxos);
    expect(utxos.map(u => u.isCoinbase)).toEqual([true, false, false]);
    expect(wallet.getUtxo()).toHaveLength(3);
  });

  it('bounds batches, isolates failed batches and coalesces concurrent preparations', async () => {
    outputs = Array.from({ length: 100 }, () => fixture(false));
    client.blockchainTransaction_getBatch.mockRejectedValueOnce(new Error('first batch failed'));
    const utxos = outputs.map(({ txhex, ...u }) => u);
    await Promise.all([BlueElectrum.prepareUtxos(utxos), BlueElectrum.prepareUtxos(utxos)]);
    expect(utxos.every(u => (u as Utxo).isCoinbase === false)).toBe(true);
    const batches = client.blockchainTransaction_getBatch.mock.calls.map(([txids]: [string[]]) => txids);
    expect(batches.map((batch: string[]) => batch.length)).toEqual([45, 45, 10, 45]);
  });

  it('invalidates heights on same-height reorg, rollback and tip changes, then uses fresh UTXO heights', async () => {
    outputs = [fixture()];
    const wallet = new LegacyWallet();
    wallet._utxo = await fetchAndPrepare();
    expect(wallet.getUtxo()).toHaveLength(1);
    header = { height: 1000, hex: '01'.repeat(80) };
    client.subscribe.emit('blockchain.headers.subscribe', [header]);
    expect(wallet.getUtxo()).toHaveLength(0);
    outputs[0].height = 902;
    wallet._utxo = await fetchAndPrepare();
    expect(wallet.getUtxo()).toHaveLength(0);
    header = { height: 1001, hex: '02'.repeat(80) };
    client.subscribe.emit('blockchain.headers.subscribe', [header]);
    wallet._utxo = await fetchAndPrepare();
    expect(wallet.getUtxo()).toHaveLength(1);
    header = { height: 999, hex: '03'.repeat(80) };
    client.subscribe.emit('blockchain.headers.subscribe', [header]);
    wallet._utxo = await fetchAndPrepare();
    expect(wallet.getUtxo()).toHaveLength(0);
  });

  it('rejects stale or unavailable actual tip even if the wall-clock estimate advances', async () => {
    outputs = [fixture()];
    const wallet = new LegacyWallet();
    wallet._utxo = await fetchAndPrepare();
    outputs[0].height = 902;
    wallet._utxo = await fetchAndPrepare();
    jest.spyOn(BlueElectrum, 'estimateCurrentBlockheight').mockReturnValue(1000000);
    expect(wallet.getUtxo()).toHaveLength(0);
    outputs[0].height = 901;
    wallet._utxo = await fetchAndPrepare();
    expect(wallet.getUtxo()).toHaveLength(1);
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 61_000);
    expect(wallet.getUtxo()).toHaveLength(0);
    jest.restoreAllMocks();
    client.blockchainHeaders_subscribe.mockRejectedValue(new Error('header unavailable'));
    wallet._utxo = await fetchAndPrepare();
    expect(wallet.getUtxo()).toHaveLength(0);
  });

  it('uses fresh history heights for replacement inputs, never cached verbose confirmations', async () => {
    outputs = [fixture()];
    const utxo = { ...outputs[0], height: 1 };
    outputs[0].height = 902;
    await BlueElectrum.prepareUtxos([utxo]);
    const wallet = new LegacyWallet();
    expect(wallet.getSpendableUtxos([utxo])).toHaveLength(0);
    expect(client.blockchainScripthash_getHistoryBatch).toHaveBeenCalledTimes(1);
  });

  it('prepares RBF/CPFP inputs and rejects a Coinbase replacement after rollback', async () => {
    const wallet = new HDSegwitBech32Wallet();
    wallet.setSecret('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    const ownedAddress = wallet._getExternalAddressByIndex(0);
    jest.spyOn(wallet, 'getChangeAddressAsync').mockResolvedValue(ownedAddress);
    const funding = new bitcoin.Transaction();
    funding.addInput(new Uint8Array(32), 0xffffffff, undefined, new Uint8Array([1, 1]));
    funding.addOutput(bitcoin.address.toOutputScript(ownedAddress), 100000n);
    outputs = [{ txid: funding.getId(), txhex: funding.toHex(), vout: 0, value: 100000, height: 901, address: ownedAddress }];
    await fetchAndPrepare();
    const { tx } = wallet.createTransaction(
      outputs.map(u => ({ ...u, wif: wallet._getWifForAddress(ownedAddress) || undefined })),
      [{ address, value: 50000 }],
      1,
      ownedAddress,
    );
    expect(tx).toBeDefined();
    const raws: Record<string, string> = { [funding.getId()]: funding.toHex(), [tx!.getId()]: tx!.toHex() };
    client.blockchainTransaction_getBatch.mockImplementation(async (txids: string[], verbose: boolean) =>
      txids.map(param => ({ param, result: verbose ? BlueElectrum.txhexToElectrumTransaction(raws[param]) : raws[param] })),
    );
    const transaction = new HDSegwitBech32Transaction(tx!.toHex(), null, wallet);
    const replacement = await transaction.createRBFbumpFee(2);
    expect(replacement.tx?.ins).toHaveLength(1);
    const cancelled = await transaction.createRBFcancelTx(2);
    expect(cancelled.tx?.ins).toHaveLength(1);
    const child = await transaction.createCPFPbumpFee(2);
    expect(child.tx?.ins).toHaveLength(1);
    header = { height: 999, hex: '04'.repeat(80) };
    client.subscribe.emit('blockchain.headers.subscribe', [header]);
    await expect(transaction.createRBFbumpFee(2)).rejects.toThrow(/spendable|immature/i);
  });

  it('prepares derived-history fallback UTXOs on non-batching servers without trusting estimated heights', async () => {
    outputs = [fixture(true, 902), fixture(false, 0)];
    const wallet = new LegacyWallet();
    jest.spyOn(wallet, 'getAddress').mockReturnValue(address);
    jest.spyOn(wallet, 'getDerivedUtxoFromOurTransaction').mockReturnValue(outputs.map(({ txhex, ...u }) => ({ ...u, height: 1 })));
    client.blockchainTransaction_get = jest.fn(async (txid: string) => outputs.find(u => u.txid === txid)?.txhex);
    client.blockchainScripthash_getHistory = jest.fn(async () => outputs.map(u => ({ tx_hash: u.txid, height: u.height })));
    BlueElectrum.setBatchingDisabled();
    await wallet.fetchUtxo();
    expect(wallet.getUtxo(true)).toHaveLength(2);
    expect(wallet.getUtxo().map(u => u.txid)).toEqual([outputs[1].txid]);
    expect(client.blockchainTransaction_get).toHaveBeenCalledTimes(2);
  });

  it('prepares actual legacy and HD wallet refreshes without changing total accounting', async () => {
    outputs = [fixture(true, 950), fixture(false)];
    const legacy = new LegacyWallet();
    jest.spyOn(legacy, 'getAddress').mockReturnValue(address);
    legacy.balance = 200000;
    await legacy.fetchUtxo();
    expect(legacy.getUtxo(true)).toHaveLength(2);
    expect(legacy.getUtxo()).toHaveLength(1);
    expect(legacy.getBalance()).toBe(200000);
    const hd = new HDSegwitBech32Wallet();
    jest.spyOn(hd, '_getExternalAddressByIndex').mockReturnValue(address);
    jest.spyOn(hd, '_getWifForAddress').mockReturnValue('');
    hd._balances_by_external_index = { 0: { c: 200000, u: 0 } };
    await hd.fetchUtxo();
    expect(hd.getUtxo(true)).toHaveLength(2);
    expect(hd.getUtxo()).toHaveLength(1);
  });
});
