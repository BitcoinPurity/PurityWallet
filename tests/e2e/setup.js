/* eslint-env jest */
/* global device */

// Background streams, telemetry and exchange-rate refreshes must not hold UI actions
// waiting for network idle. Screens that fetch data still wait for their UI result.
const URL_BLACKLIST = [
  '.*arkade\\.computer/v1/indexer/script/subscription.*',
  '.*groundcontrol-bluewallet\\.herokuapp\\.com.*',
  '.*groundcontrol\\.bluewallet\\.io/.*',
  '.*api\\.kraken\\.com/.*',
  '.*api\\.yadio\\.io/.*',
  '.*bugsnag\\.com/.*',
];

beforeAll(async () => {
  if (typeof device === 'undefined' || !device?.launchApp) return;

  const originalLaunchApp = device.launchApp.bind(device);
  device.launchApp = async (params = {}, ...args) => {
    const result = await originalLaunchApp(
      { ...params, launchArgs: { ...params.launchArgs, detoxURLBlacklistRegex: URL_BLACKLIST } },
      ...args,
    );
    await device.setURLBlacklist(URL_BLACKLIST);
    return result;
  };
});
