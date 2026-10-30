import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkNotifications } from 'react-native-permissions';
import { getPushToken, initializeNotifications, isNotificationsCapable, majorTomToGroundControl } from '../../blue_modules/notifications';
import { fetch } from '../../util/fetch';

jest.mock('react-native', () => {
  const native = jest.requireActual('react-native');
  native.Platform.OS = 'android';
  return native;
});
jest.mock('../../util/fetch', () => ({ fetch: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async key => (key === 'PUSH_TOKEN' ? JSON.stringify({ os: 'android', token: 'old-fcm-token' }) : null)),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('react-native-device-info', () => ({
  hasGmsSync: () => true,
  hasHmsSync: () => false,
}));

it('does not expose remote push capability or reuse a saved Android token', async () => {
  expect(isNotificationsCapable).toBe(false);
  expect(await getPushToken()).toBeNull();
  expect(AsyncStorage.getItem).not.toHaveBeenCalledWith('PUSH_TOKEN');
});

it('skips Android remote registration and permission checks', async () => {
  await initializeNotifications();
  await majorTomToGroundControl(['test-address'], [], []);
  expect(checkNotifications).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
