import { Transaction } from 'bitcoinjs-lib';

export const COINBASE_MATURITY = 100;

const coinbaseStatus = new Map<string, boolean>();

type CoinbaseUtxo = { txid: string; txhex?: string; isCoinbase?: boolean };

export function getCoinbaseStatus(utxo: CoinbaseUtxo): boolean | undefined {
  const cached = coinbaseStatus.get(utxo.txid);
  if (cached !== undefined) return cached;
  if (utxo.txhex) {
    try {
      const tx = Transaction.fromHex(utxo.txhex);
      if (tx.getId() !== utxo.txid || tx.ins.length === 0) return undefined;
      if (tx.isCoinbase() && tx.ins[0].index !== 0xffffffff) return undefined;
      const result = tx.isCoinbase();
      coinbaseStatus.set(utxo.txid, result);
      return result;
    } catch {
      return undefined;
    }
  }
  return utxo.isCoinbase;
}

export function isUtxoSpendable(
  utxo: { isCoinbase?: boolean; height?: number },
  tipHeight: number | null | undefined,
  policy: { frozen?: boolean } = {},
): boolean {
  if (policy.frozen || utxo.isCoinbase === undefined) return false;
  if (utxo.isCoinbase === false) return true;
  return (
    Number.isSafeInteger(tipHeight) &&
    tipHeight! >= 0 &&
    Number.isSafeInteger(utxo.height) &&
    utxo.height! > 0 &&
    utxo.height! <= tipHeight! &&
    tipHeight! - utxo.height! + 1 >= COINBASE_MATURITY
  );
}
