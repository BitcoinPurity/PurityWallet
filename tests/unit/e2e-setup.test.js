it('configures ignored background requests before launching the app and preserves launch options', async () => {
  const previous = { beforeAll: global.beforeAll, device: global.device };
  let setup;
  const launchApp = jest.fn().mockResolvedValue('launched');
  const setURLBlacklist = jest.fn();
  global.beforeAll = callback => (setup = callback);
  global.device = { launchApp, setURLBlacklist };
  try {
    jest.isolateModules(() => require('../e2e/setup'));
    await setup();
    expect(setURLBlacklist).not.toHaveBeenCalled();
    await expect(global.device.launchApp({ delete: true, launchArgs: { example: 'kept' } })).resolves.toBe('launched');
    const [options] = launchApp.mock.calls[0];
    expect(options.delete).toBe(true);
    expect(options.launchArgs.example).toBe('kept');
    for (const url of [
      'https://api.kraken.com/0/public/Ticker',
      'https://api.yadio.io/json/ARS',
      'https://sessions.bugsnag.com/',
      'https://groundcontrol.bluewallet.io/setTokenConfiguration',
    ]) {
      expect(options.launchArgs.detoxURLBlacklistRegex.some(pattern => new RegExp(pattern).test(url))).toBe(true);
    }
  } finally {
    Object.assign(global, previous);
  }
});
