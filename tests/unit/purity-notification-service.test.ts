import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  enqueueTestPushNotification,
  majorTomToGroundControl,
  registerArkPaymentPush,
  unsubscribe,
} from '../../blue_modules/notifications';
import { fetch } from '../../util/fetch';

jest.unmock('../../blue_modules/constants');
jest.mock('../../util/fetch', () => ({ fetch: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('react-native-device-info', () => ({
  getApplicationName: () => 'PurityWallet',
  getSystemName: () => 'iOS',
  getSystemVersion: () => '27.0',
  getVersion: () => '1.0.0',
  hasGmsSync: () => false,
  hasHmsSync: () => false,
}));

const pushToken = { token: 'a'.repeat(64), os: 'ios' };
const fetchMock = fetch as jest.Mock;

beforeEach(() => {
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async key => (key === 'PUSH_TOKEN' ? JSON.stringify(pushToken) : null));
  fetchMock.mockReset().mockResolvedValue({ ok: true, text: async () => '{}' });
});

it('registers payment subscriptions with BitcoinPurity', async () => {
  await majorTomToGroundControl(['test-address'], [], ['test-txid']);
  expect(fetchMock).toHaveBeenCalledWith(
    'https://notifications.bitcoinpurity.org/majorTomToGroundControl',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        addresses: ['test-address'],
        hashes: [],
        txids: ['test-txid'],
        ...pushToken,
      }),
    }),
  );
});

it('removes subscriptions from the same BitcoinPurity service', async () => {
  await unsubscribe(['test-address'], [], ['test-txid']);
  expect(fetchMock).toHaveBeenCalledWith(
    'https://notifications.bitcoinpurity.org/unsubscribe',
    expect.objectContaining({ method: 'POST' }),
  );
});

it('sends test-push requests to BitcoinPurity', async () => {
  await enqueueTestPushNotification();
  expect(fetchMock).toHaveBeenCalledWith('https://notifications.bitcoinpurity.org/enqueue', expect.objectContaining({ method: 'POST' }));
});

it('does not register Ark swaps with a third-party push service', async () => {
  await registerArkPaymentPush('test-hash', 'test-swap', {} as never);
  expect(fetchMock).not.toHaveBeenCalled();
});
