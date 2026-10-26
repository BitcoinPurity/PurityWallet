import * as bitcoin from 'bitcoinjs-lib';
import type { CreateTransactionUtxo } from '../class/wallets/types';
import { uint8ArrayToHex } from './uint8array-extras';

export type LegacyUtxo = Pick<CreateTransactionUtxo, 'txid' | 'vout' | 'value' | 'address'>;
export type LegacyUtxoStatus = 'shared' | 'absent' | 'unknown';
export type LegacyUtxoResults = Record<string, LegacyUtxoStatus>;

const API = 'https://mempool.space/api';
const CONCURRENCY = 4;
const MISSING_TRANSACTION = Symbol('missing transaction');

async function requestJson(path: string, allowMissing = false): Promise<any> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(`${API}${path}`, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (allowMissing && response.status === 404) return MISSING_TRANSACTION;
        if (!response.ok) throw new Error('Legacy-chain API request failed');
        return response.json();
      })(),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error('Legacy-chain API request timed out'));
        }, 10000);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function checkLegacyUtxos(utxos: readonly LegacyUtxo[]): Promise<LegacyUtxoResults> {
  const results: LegacyUtxoResults = {};
  const groups = new Map<string, LegacyUtxo[]>();
  for (const coin of utxos) {
    results[`${coin.txid}:${coin.vout}`] = 'unknown';
    if (!/^[a-f0-9]{64}$/i.test(coin.txid) || !Number.isInteger(coin.vout) || coin.vout < 0 || !coin.address) continue;
    const group = groups.get(coin.txid) ?? [];
    group.push(coin);
    groups.set(coin.txid, group);
  }

  const entries = [...groups.entries()];
  for (let offset = 0; offset < entries.length; offset += CONCURRENCY) {
    await Promise.all(
      entries.slice(offset, offset + CONCURRENCY).map(async ([txid, coins]) => {
        try {
          const tx = await requestJson(`/tx/${txid}`, true);
          if (tx === MISSING_TRANSACTION) {
            for (const coin of coins) results[`${coin.txid}:${coin.vout}`] = 'absent';
            return;
          }
          if (tx.txid !== txid || !Array.isArray(tx.vout)) return;
          const outspends = await requestJson(`/tx/${txid}/outspends`);
          if (!Array.isArray(outspends)) return;
          for (const coin of coins) {
            const output = tx.vout[coin.vout];
            const spent = outspends[coin.vout]?.spent;
            if (!output || !Number.isSafeInteger(output.value) || typeof output.scriptpubkey !== 'string' || typeof spent !== 'boolean') {
              continue;
            }
            const script = uint8ArrayToHex(bitcoin.address.toOutputScript(coin.address!));
            results[`${coin.txid}:${coin.vout}`] =
              !spent && output.value === coin.value && output.scriptpubkey === script ? 'shared' : 'absent';
          }
        } catch {
          // Failed requests remain unknown; they must never clear a replay warning.
        }
      }),
    );
  }
  return results;
}

export function getLegacyReplayStatus(utxos: readonly LegacyUtxo[], results: LegacyUtxoResults): LegacyUtxoStatus {
  if (utxos.some(coin => !results[`${coin.txid}:${coin.vout}`] || results[`${coin.txid}:${coin.vout}`] === 'unknown')) return 'unknown';
  return utxos.length > 0 && utxos.every(coin => results[`${coin.txid}:${coin.vout}`] === 'shared') ? 'shared' : 'absent';
}
