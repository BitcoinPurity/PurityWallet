import * as bitcoin from 'bitcoinjs-lib';
import { checkLegacyUtxos, getLegacyReplayStatus, LegacyUtxo } from '../../blue_modules/legacy-chain';

const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
const scriptpubkey = Buffer.from(bitcoin.address.toOutputScript(address)).toString('hex');
const coin: LegacyUtxo = {
  txid: 'a'.repeat(64),
  vout: 0,
  value: 50000,
  address,
};
const key = `${coin.txid}:0`;
const mockFetch = jest.fn();
const originalFetch = global.fetch;
const response = (body: unknown, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => body,
});

beforeEach(() => {
  global.fetch = mockFetch;
  mockFetch.mockReset();
  mockFetch.mockResolvedValueOnce(response({ txid: coin.txid, vout: [{ value: coin.value, scriptpubkey }] }));
  mockFetch.mockResolvedValueOnce(response([{ spent: false }]));
});

afterAll(() => {
  global.fetch = originalFetch;
});

describe('legacy-chain UTXO checks', () => {
  it('matches the exact unspent output and uses only mempool.space read requests', async () => {
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'shared' });
    expect(mockFetch.mock.calls.map(([url]) => url)).toEqual([
      `https://mempool.space/api/tx/${coin.txid}`,
      `https://mempool.space/api/tx/${coin.txid}/outspends`,
    ]);
  });

  it.each([
    ['spent output', { value: coin.value, scriptpubkey }, { spent: true }],
    ['different value', { value: 1, scriptpubkey }, { spent: false }],
    ['different script', { value: coin.value, scriptpubkey: '51' }, { spent: false }],
  ])('does not match a %s', async (_, output, outspend) => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(response({ txid: coin.txid, vout: [output] }));
    mockFetch.mockResolvedValueOnce(response([outspend]));
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'absent' });
  });

  it('treats only a transaction 404 as absence', async () => {
    mockFetch.mockReset().mockResolvedValue(response(null, 404));
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'absent' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([null, {}, { txid: coin.txid }, { txid: coin.txid, vout: null }])(
    'keeps malformed successful transaction responses unknown: %j',
    async payload => {
      mockFetch.mockReset().mockResolvedValue(response(payload));
      expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'unknown' });
    },
  );

  it('does not interpret an outspends 404 as a missing transaction', async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(response({ txid: coin.txid, vout: [{ value: coin.value, scriptpubkey }] }));
    mockFetch.mockResolvedValueOnce(response(null, 404));
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'unknown' });
  });

  it.each([429, 500, 403])('keeps HTTP %s errors unknown', async status => {
    mockFetch.mockReset().mockResolvedValue(response(null, status));
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'unknown' });
  });

  it.each([{}, [{ spent: 'false' }], [], null])('keeps malformed outspends unknown: %j', async payload => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      response({
        txid: coin.txid,
        vout: [{ value: coin.value, scriptpubkey }],
      }),
    );
    mockFetch.mockResolvedValueOnce(response(payload));
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'unknown' });
  });

  it('does not accept another transaction or an invalid output index', async () => {
    mockFetch.mockReset().mockResolvedValue(
      response({
        txid: 'b'.repeat(64),
        vout: [{ value: coin.value, scriptpubkey }],
      }),
    );
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'unknown' });
    expect(await checkLegacyUtxos([{ ...coin, vout: -1 }])).toEqual({
      [`${coin.txid}:-1`]: 'unknown',
    });
  });

  it('groups outputs of the same transaction but checks each output index', async () => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValueOnce(
      response({
        txid: coin.txid,
        vout: [
          { value: coin.value, scriptpubkey },
          { value: coin.value, scriptpubkey },
        ],
      }),
    );
    mockFetch.mockResolvedValueOnce(response([{ spent: true }, { spent: false }]));
    expect(await checkLegacyUtxos([coin, { ...coin, vout: 1 }])).toEqual({
      [key]: 'absent',
      [`${coin.txid}:1`]: 'shared',
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retains successful results when another transaction fails', async () => {
    mockFetch.mockReset().mockImplementation(async (url: string) => {
      if (url.includes('b'.repeat(64))) throw new Error('offline');
      return response(url.endsWith('/outspends') ? [{ spent: false }] : { txid: coin.txid, vout: [{ value: coin.value, scriptpubkey }] });
    });
    expect(await checkLegacyUtxos([coin, { ...coin, txid: 'b'.repeat(64) }])).toEqual({
      [key]: 'shared',
      [`${'b'.repeat(64)}:0`]: 'unknown',
    });
  });

  it('limits concurrent API requests for a large Coin Control list', async () => {
    let active = 0;
    let peak = 0;
    mockFetch.mockReset().mockImplementation(async (url: string) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise(resolve => setImmediate(resolve));
      active--;
      const txid = url.split('/tx/')[1].split('/')[0];
      return response(url.endsWith('/outspends') ? [{ spent: false }] : { txid, vout: [{ value: coin.value, scriptpubkey }] });
    });
    const coins = Array.from({ length: 9 }, (_, index) => ({ ...coin, txid: index.toString(16).padStart(64, '0') }));
    const results = await checkLegacyUtxos(coins);
    expect(Object.values(results)).toEqual(Array(9).fill('shared'));
    expect(peak).toBeLessThanOrEqual(4);
    expect(mockFetch).toHaveBeenCalledTimes(18);
  });

  it('aborts and returns unknown after the request timeout', async () => {
    jest.useFakeTimers();
    mockFetch.mockReset().mockImplementation(() => new Promise(() => {}));
    try {
      const pending = checkLegacyUtxos([coin]);
      await jest.advanceTimersByTimeAsync(10000);
      expect(await pending).toEqual({ [key]: 'unknown' });
      expect(mockFetch.mock.calls[0][1].signal.aborted).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });

  it('also times out when the HTTP response body stalls', async () => {
    jest.useFakeTimers();
    mockFetch.mockReset().mockResolvedValue({ ok: true, status: 200, json: () => new Promise(() => {}) });
    try {
      const pending = checkLegacyUtxos([coin]);
      await jest.advanceTimersByTimeAsync(10000);
      expect(await pending).toEqual({ [key]: 'unknown' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not reuse old results for a later signing attempt', async () => {
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'shared' });
    mockFetch.mockResolvedValueOnce(response(null, 404));
    expect(await checkLegacyUtxos([coin])).toEqual({ [key]: 'absent' });
  });

  it('does not request anything for an empty selection', async () => {
    expect(await checkLegacyUtxos([])).toEqual({});
    expect(mockFetch).not.toHaveBeenCalled();
    expect(getLegacyReplayStatus([], {})).toBe('absent');
  });

  it('requires every input to be shared and never treats unknown as absent', () => {
    const second = { ...coin, vout: 1 };
    expect(getLegacyReplayStatus([coin], { [key]: 'shared' })).toBe('shared');
    expect(
      getLegacyReplayStatus([coin, second], {
        [key]: 'shared',
        [`${coin.txid}:1`]: 'absent',
      }),
    ).toBe('absent');
    expect(getLegacyReplayStatus([coin, second], { [key]: 'shared' })).toBe('unknown');
  });
});
