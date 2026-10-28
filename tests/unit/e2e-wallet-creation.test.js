import { helperCreateWallet } from '../e2e/helperz';

jest.mock('detox', () => ({ element: jest.fn() }));

describe('E2E default wallet creation', () => {
  it.each([false, true])('gates only vault creation tests when wallet-type selection is %s', enabled => {
    const previous = { describe: global.describe, it: global.it, log: console.log, warn: console.warn };
    const runnable = jest.fn();
    runnable.skip = jest.fn();
    global.describe = (_, body) => body();
    global.it = runnable;
    jest.doMock('../../blue_modules/features', () => ({ isWalletTypeSelectionEnabled: enabled, isLightningUiEnabled: false }));
    try {
      jest.isolateModules(() => require('../e2e/bluewallet.spec'));
    } finally {
      global.describe = previous.describe;
      global.it = previous.it;
      console.log = previous.log;
      console.warn = previous.warn;
      jest.dontMock('../../blue_modules/features');
    }
    expect(runnable.skip).toHaveBeenCalledTimes(enabled ? 0 : 3);
    expect(runnable).toHaveBeenCalledTimes(enabled ? 13 : 10);
    expect(runnable.mock.calls.some(([title]) => title.includes('multisig setup from UR'))).toBe(true);
  });

  it('creates the default on-chain wallet without requiring a wallet-type picker', async () => {
    jest.useFakeTimers();
    const previous = {
      by: global.by,
      waitFor: global.waitFor,
      device: global.device,
      expect: global.expect,
    };
    const { element } = require('detox');
    const tap = jest.fn();
    const visibleIds = new Set([
      'CreateAWallet',
      'WalletsList',
      'WalletNameInput',
      'Create',
      'PleaseBackupScrollView',
      'PleasebackupOk',
      'test',
    ]);
    global.by = {
      id: id => {
        if (!visibleIds.has(id)) throw new Error(`No visible view: ${id}`);
        return id;
      },
    };
    element.mockImplementation(id => ({
      tap: () => tap(id),
      replaceText: jest.fn(),
      swipe: jest.fn(),
    }));
    const chain = {
      toBeVisible: () => chain,
      whileElement: () => chain,
      scroll: jest.fn(),
      withTimeout: jest.fn(),
    };
    global.waitFor = () => chain;
    global.device = { getPlatform: () => 'android' };
    global.expect = () => chain;
    try {
      const creation = helperCreateWallet('test');
      await Promise.all([creation, jest.runAllTimersAsync()]);
      previous.expect(tap).toHaveBeenCalledWith('Create');
      previous.expect(tap).toHaveBeenCalledWith('PleasebackupOk');
    } finally {
      Object.assign(global, previous);
      jest.useRealTimers();
    }
  });
});
