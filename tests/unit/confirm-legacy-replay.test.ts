import presentAlert from '../../components/Alert';
import loc from '../../loc';
import { checkLegacyUtxos } from '../../blue_modules/legacy-chain';
import { confirmLegacyReplayRisk } from '../../screen/send/confirmLegacyReplayRisk';

jest.mock('../../components/Alert', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../blue_modules/legacy-chain', () => ({
  ...jest.requireActual('../../blue_modules/legacy-chain'),
  checkLegacyUtxos: jest.fn(),
}));

const coin = {
  txid: 'a'.repeat(64),
  vout: 0,
  value: 50000,
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
};
const key = `${coin.txid}:0`;
const mockCheck = jest.mocked(checkLegacyUtxos);
const mockAlert = jest.mocked(presentAlert);

beforeEach(() => jest.clearAllMocks());

it.each(['shared', 'unknown'] as const)('awaits explicit acknowledgement before signing for %s inputs', async status => {
  mockCheck.mockResolvedValue({ [key]: status });
  const sign = jest.fn();
  const pending = confirmLegacyReplayRisk([coin]).then(confirmed => confirmed && sign());
  await new Promise(resolve => setImmediate(resolve));
  expect(sign).not.toHaveBeenCalled();
  const alert = mockAlert.mock.calls[0][0];
  expect(alert.options?.cancelable).toBe(false);
  expect(alert.message).toBe(status === 'unknown' ? loc.send.legacy_check_failed : loc.send.legacy_replay_warning);
  alert.buttons?.find(button => button.text === loc.send.legacy_replay_accept)?.onPress?.();
  await pending;
  expect(sign).toHaveBeenCalledTimes(1);
});

it.each(['shared', 'unknown'] as const)('cancels without permitting signing for %s inputs', async status => {
  mockCheck.mockResolvedValue({ [key]: status });
  const pending = confirmLegacyReplayRisk([coin]);
  await new Promise(resolve => setImmediate(resolve));
  mockAlert.mock.calls[0][0].buttons?.find(button => button.style === 'cancel')?.onPress?.();
  expect(await pending).toBe(false);
});

it('does not ask for all-shared acknowledgement when an input is absent', async () => {
  mockCheck.mockResolvedValue({
    [key]: 'shared',
    [`${coin.txid}:1`]: 'absent',
  });
  expect(await confirmLegacyReplayRisk([coin, { ...coin, vout: 1 }])).toBe(true);
  expect(mockAlert).not.toHaveBeenCalled();
});

it.each(['shared', 'unknown'] as const)('does not present a late %s alert after the send attempt becomes obsolete', async status => {
  mockCheck.mockResolvedValue({ [key]: status });
  expect(await confirmLegacyReplayRisk([coin], () => false)).toBe(false);
  expect(mockAlert).not.toHaveBeenCalled();
});
