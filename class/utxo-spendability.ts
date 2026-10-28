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

export type UtxoSpendabilityReason = 'spendable' | 'frozen' | 'unknown_coinbase_status' | 'unknown_chain_height' | 'immature_coinbase';

export function getUtxoSpendabilityReason(
  utxo: { isCoinbase?: boolean; height?: number },
  tipHeight: number | null | undefined,
  policy: { frozen?: boolean } = {},
): UtxoSpendabilityReason {
  if (policy.frozen) return 'frozen';
  if (utxo.isCoinbase === undefined) return 'unknown_coinbase_status';
  if (utxo.isCoinbase === false) return 'spendable';
  if (
    !(
      Number.isSafeInteger(tipHeight) &&
      tipHeight! >= 0 &&
      Number.isSafeInteger(utxo.height) &&
      utxo.height! > 0 &&
      utxo.height! <= tipHeight!
    )
  )
    return 'unknown_chain_height';
  return tipHeight! - utxo.height! + 1 >= COINBASE_MATURITY ? 'spendable' : 'immature_coinbase';
}

export function isUtxoSpendable(
  utxo: { isCoinbase?: boolean; height?: number },
  tipHeight: number | null | undefined,
  policy: { frozen?: boolean } = {},
): boolean {
  return getUtxoSpendabilityReason(utxo, tipHeight, policy) === 'spendable';
}
