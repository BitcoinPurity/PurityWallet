import { element } from 'detox';
import { dismissAlertByText } from '../e2e/helperz';

jest.mock('detox', () => ({ element: jest.fn() }));

it.each([false, true])('reports dismissal only when the alert disappears (tap closes alert: %s)', async tapClosesAlert => {
  jest.useFakeTimers();
  const previous = { by: global.by, waitFor: global.waitFor, device: global.device };
  let visible = true;
  const tap = jest.fn(async () => {
    if (tapClosesAlert) visible = false;
  });
  element.mockImplementation(() => ({ atIndex: () => ({ tap }) }));
  global.by = { text: value => value, label: value => value };
  global.waitFor = () => ({
    not: {
      toExist: () => ({
        withTimeout: async () => {
          if (visible) throw new Error('Alert is still present');
        },
      }),
    },
  });
  global.device = { getPlatform: () => 'ios', disableSynchronization: jest.fn(), enableSynchronization: jest.fn() };
  try {
    const result = dismissAlertByText('OK', 1);
    await jest.runAllTimersAsync();
    await expect(result).resolves.toBe(tapClosesAlert);
    expect(global.device.enableSynchronization).toHaveBeenCalledTimes(1);
  } finally {
    Object.assign(global, previous);
    jest.useRealTimers();
  }
});
