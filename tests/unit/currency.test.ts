import assert from 'assert';

import {
  _setExchangeRate,
  _setPreferredFiatCurrency,
  BTCToLocalCurrency,
  satoshiToBTC,
  satoshiToLocalCurrency,
} from '../../blue_modules/currency';
import { FiatUnit } from '../../models/fiatUnit';

describe('currency', () => {
  it('formats everything correctly', async () => {
    _setExchangeRate('BTC_USD', 10000);

    assert.strictEqual(satoshiToLocalCurrency(1), '$0.0001');
    assert.strictEqual(satoshiToLocalCurrency(-1), '-$0.0001');
    assert.strictEqual(satoshiToLocalCurrency(123), '$0.01');
    assert.strictEqual(satoshiToLocalCurrency(156), '$0.02');
    assert.strictEqual(satoshiToLocalCurrency(51), '$0.01');
    assert.strictEqual(satoshiToLocalCurrency(45), '$0.0045');
    assert.strictEqual(satoshiToLocalCurrency(123456789), '$12,345.68');

    assert.strictEqual(BTCToLocalCurrency(1), '$10,000.00');
    assert.strictEqual(BTCToLocalCurrency(-1), '-$10,000.00');
    assert.strictEqual(BTCToLocalCurrency(1.00000001), '$10,000.00');
    assert.strictEqual(BTCToLocalCurrency(1.0000123), '$10,000.12');
    assert.strictEqual(BTCToLocalCurrency(1.0000146), '$10,000.15');

    assert.strictEqual(satoshiToBTC(1), '0.00000001');
    assert.strictEqual(satoshiToBTC(-1), '-0.00000001');
    assert.strictEqual(satoshiToBTC(100000000), '1');
    assert.strictEqual(satoshiToBTC(123456789123456789), '1234567891.2345678'); // eslint-disable-line no-loss-of-precision

    _setPreferredFiatCurrency(FiatUnit.JPY);
    _setExchangeRate('BTC_JPY', 1043740.8614);

    assert.ok(satoshiToLocalCurrency(1) === '¥0.01' || satoshiToLocalCurrency(1) === '￥0.01', 'Unexpected: ' + satoshiToLocalCurrency(1));
  });
});

describe('preference namespace compatibility', () => {
  it.each([
    ['android', 'group.io.bluewallet.bluewallet'],
    ['ios', 'group.au.com.bitcoininstitute.puritywallet'],
  ] as const)('reads the existing %s currency preference', async (platform, group) => {
    let preferences!: typeof import('react-native-default-preference').default;
    let currency!: typeof import('../../blue_modules/currency');
    jest.isolateModules(() => {
      const { Platform } = require('react-native');
      jest.replaceProperty(Platform, 'OS', platform);
      preferences = require('react-native-default-preference');
      currency = require('../../blue_modules/currency');
    });
    try {
      await preferences.setName(group);
      await preferences.set('preferredCurrency', 'AUD');
      expect((await currency.getPreferredCurrency()).endPointKey).toBe('AUD');
      expect(await preferences.getName()).toBe(group);
    } finally {
      jest.restoreAllMocks();
    }
  });
});
