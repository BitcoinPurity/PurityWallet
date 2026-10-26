import { useEffect, useState } from 'react';
import { checkLegacyUtxos, LegacyUtxo, LegacyUtxoResults } from '../blue_modules/legacy-chain';

export function useLegacyUtxoCheck(utxos: readonly LegacyUtxo[], refreshKey = ''): { checking: boolean; results: LegacyUtxoResults } {
  const key = JSON.stringify(
    utxos.map(({ txid, vout, value, address }) => ({
      txid,
      vout,
      value,
      address,
    })),
  );
  const [state, setState] = useState<{
    key: string;
    refreshKey: string;
    results: LegacyUtxoResults;
  }>();

  useEffect(() => {
    let current = true;
    const coins: LegacyUtxo[] = JSON.parse(key);
    checkLegacyUtxos(coins).then(results => {
      if (current) setState({ key, refreshKey, results });
    });
    return () => {
      current = false;
    };
  }, [key, refreshKey]);

  const checking = utxos.length > 0 && (state?.key !== key || state?.refreshKey !== refreshKey);
  return { checking, results: checking ? {} : (state?.results ?? {}) };
}
