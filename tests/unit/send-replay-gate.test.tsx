import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import SendDetails from '../../screen/send/SendDetails';
import CoinControl from '../../screen/send/CoinControl';
import { checkLegacyUtxos, LegacyUtxoResults } from '../../blue_modules/legacy-chain';
import presentAlert from '../../components/Alert';
import loc from '../../loc';

const coin = {
  txid: 'a'.repeat(64),
  vout: 0,
  value: 50000,
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  height: 1,
  isCoinbase: false,
};
const otherCoin = { ...coin, txid: 'b'.repeat(64) };
const key = `${coin.txid}:0`;
const mockUiCheck = jest.fn((_coins: unknown, _refresh: unknown) => ({ checking: false, results: {} as LegacyUtxoResults }));
const mockNavigation = { navigate: jest.fn(), setParams: jest.fn(), setOptions: jest.fn(), goBack: jest.fn(), isFocused: () => true };
let mockRoute: any;
const mockWallet = {
  type: 'test-wallet',
  chain: 'ONCHAIN',
  allowSend: () => true,
  getID: () => 'wallet',
  getBalance: () => 100000,
  getSpendableBalance: () => coin.value,
  getLabel: () => 'Wallet',
  getPreferredBalanceUnit: () => 'BTC',
  getUtxo: () => [coin, otherCoin],
  getSpendableUtxos: () => [coin],
  fetchUtxo: async () => {},
  getUTXOMetadata: (_txid: string, vout: number) => ({ frozen: _txid === otherCoin.txid }),
  setUTXOMetadata: () => {},
  addressIsChange: () => false,
  getChangeAddressAsync: async () => coin.address,
  isAddressValid: () => true,
  allowBIP47: () => false,
  allowCosignPsbt: () => false,
  coinselect: jest.fn(() => ({ inputs: [coin], fee: 100, outputs: [{ address: coin.address, value: 10000 }] })),
  createTransaction: jest.fn(() => ({
    tx: { getId: () => 'signed', toHex: () => 'signed-hex' },
    psbt: {},
    fee: 100,
    outputs: [{ address: otherCoin.address, value: 10000 }],
  })),
};
const mockStorage = { wallets: [mockWallet], sleep: () => new Promise(() => {}), txMetadata: {}, saveToDisk: jest.fn() };

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useLocale: () => ({ direction: 'ltr' }),
  useFocusEffect: (callback: () => void) => require('react').useEffect(callback, [callback]),
}));
jest.mock('../../hooks/context/useStorage', () => ({ useStorage: () => mockStorage }));
jest.mock('../../hooks/useLegacyUtxoCheck', () => ({
  useLegacyUtxoCheck: (coins: unknown, refresh: unknown) => mockUiCheck(coins, refresh),
}));
jest.mock('../../blue_modules/legacy-chain', () => ({
  ...jest.requireActual('../../blue_modules/legacy-chain'),
  checkLegacyUtxos: jest.fn(),
}));
jest.mock('../../components/Alert', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../../components/themes', () => {
  const colors = {};
  return { useTheme: () => ({ colors }) };
});
jest.mock('../../components/SafeArea', () => ({ __esModule: true, default: require('react-native').View }));
jest.mock('../../components/Icon', () => () => null);
jest.mock('../../components/Avatar', () => () => null);
jest.mock('../../components/SafeAreaScrollView', () => ({ __esModule: true, default: require('react-native').ScrollView }));
jest.mock('../../components/FloatButtons', () => ({ FButton: () => null, FContainer: require('react-native').View }));
jest.mock('../../blue_modules/hapticFeedback', () => ({
  ...jest.requireActual('../../blue_modules/hapticFeedback'),
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('../../components/headerMenuOptions', () => ({ createEllipsisHeaderMenuOptions: () => ({}) }));
jest.mock('../../components/AmountInput', () => ({
  AmountInput: (props: any) => React.createElement(require('react-native').TextInput, { ...props, testID: 'amount', value: props.amount }),
}));
jest.mock('../../components/AddressInput', () => ({
  __esModule: true,
  default: (props: any) => React.createElement(require('react-native').TextInput, { ...props, testID: 'recipient', value: props.address }),
}));
jest.mock('../../components/DismissKeyboardInputAccessory', () => ({ DismissKeyboardInputAccessory: () => null }));
jest.mock('../../components/InputAccessoryAllFunds', () => ({ __esModule: true, default: () => null }));
jest.mock('../../screen/ActionSheet', () => ({}));
jest.mock('../../blue_modules/fs', () => ({}));
jest.mock('../../models/networkTransactionFees', () => {
  const actual = jest.requireActual('../../models/networkTransactionFees');
  return { ...actual, __esModule: true, default: { recommendedFees: async () => new actual.NetworkTransactionFee(3, 2, 1) } };
});

const mockCheck = jest.mocked(checkLegacyUtxos);
const mockAlert = jest.mocked(presentAlert);

beforeEach(() => {
  jest.clearAllMocks();
  mockUiCheck.mockReturnValue({ checking: false, results: {} });
  mockRoute = {
    params: {
      walletID: 'wallet',
      isEditable: true,
      addRecipientParams: { address: coin.address, amount: '0.0001' },
      utxos: [coin, otherCoin],
    },
  };
});

async function startSend() {
  const screen = render(<SendDetails />);
  await waitFor(() => expect(screen.getByTestId('CreateTransactionButton')).toBeEnabled());
  fireEvent.press(screen.getByTestId('CreateTransactionButton'));
  await waitFor(() => expect(mockCheck).toHaveBeenCalled());
  return screen;
}

it('checks actual chosen inputs and waits for acknowledgement before the signing call', async () => {
  mockCheck.mockResolvedValue({ [key]: 'shared' });
  await startSend();
  expect(mockCheck).toHaveBeenCalledWith([coin]);
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
  await act(async () => mockAlert.mock.calls[0][0].buttons?.find(button => button.text === loc.send.legacy_replay_accept)?.onPress?.());
  expect(mockWallet.createTransaction).toHaveBeenCalledTimes(1);
  expect(mockNavigation.navigate).toHaveBeenCalledWith('Confirm', expect.objectContaining({ tx: 'signed-hex' }));
});

it.each(['shared', 'unknown'] as const)('does not sign or navigate after cancelling the %s warning', async status => {
  mockCheck.mockResolvedValue({ [key]: status });
  const screen = await startSend();
  await act(async () => mockAlert.mock.calls[0][0].buttons?.find(button => button.style === 'cancel')?.onPress?.());
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  expect(screen.getByTestId('CreateTransactionButton')).toBeTruthy();
});

it('allows signing after explicit risk acknowledgement when the check fails', async () => {
  mockCheck.mockResolvedValue({ [key]: 'unknown' });
  await startSend();
  await waitFor(() => expect(mockAlert).toHaveBeenCalledWith(expect.objectContaining({ message: loc.send.legacy_check_failed })));
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
  expect(mockNavigation.navigate).not.toHaveBeenCalled();
  const alert = mockAlert.mock.calls[0][0];
  expect(alert.options?.cancelable).toBe(false);
  await act(async () => alert.buttons?.find(button => button.text === loc.send.legacy_replay_accept)?.onPress?.());
  expect(mockWallet.createTransaction).toHaveBeenCalledTimes(1);
  expect(mockNavigation.navigate).toHaveBeenCalledWith('Confirm', expect.objectContaining({ tx: 'signed-hex' }));
});

it('checks automatically selected inputs too', async () => {
  mockRoute.params.utxos = null;
  mockCheck.mockResolvedValue({ [key]: 'absent' });
  await startSend();
  await waitFor(() => expect(mockWallet.createTransaction).toHaveBeenCalledTimes(1));
  expect(mockCheck).toHaveBeenCalledWith([coin]);
});

it('stops a pending attempt when the selected inputs change', async () => {
  let complete!: (results: LegacyUtxoResults) => void;
  mockCheck.mockReturnValue(new Promise(resolve => (complete = resolve)));
  const screen = await startSend();
  mockRoute = { params: { ...mockRoute.params, utxos: [otherCoin] } };
  screen.rerender(<SendDetails />);
  await act(async () => complete({ [key]: 'absent' }));
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
});

it('stops a pending attempt when the amount changes', async () => {
  let complete!: (results: LegacyUtxoResults) => void;
  mockCheck.mockReturnValue(new Promise(resolve => (complete = resolve)));
  const screen = await startSend();
  fireEvent.changeText(screen.getByTestId('amount'), '0.0002');
  await act(async () => complete({ [key]: 'absent' }));
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
});

it('does not sign after the screen is unmounted during the check', async () => {
  let complete!: (results: LegacyUtxoResults) => void;
  mockCheck.mockReturnValue(new Promise(resolve => (complete = resolve)));
  const screen = await startSend();
  screen.unmount();
  await act(async () => complete({ [key]: 'absent' }));
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
});

it.each(['shared', 'unknown'] as const)('discards %s acknowledgement when the recipient changed while the alert was open', async status => {
  mockCheck.mockResolvedValue({ [key]: status });
  const screen = await startSend();
  fireEvent.changeText(screen.getByTestId('recipient'), '1BoatSLRHtKNngkdXEeobR76b53LETtpyT');
  await act(async () => mockAlert.mock.calls[0][0].buttons?.find(button => button.text === loc.send.legacy_replay_accept)?.onPress?.());
  expect(mockWallet.createTransaction).not.toHaveBeenCalled();
});

it('shows the Send warning only when all selected inputs match', async () => {
  mockUiCheck.mockReturnValue({ checking: false, results: { [key]: 'shared', [`${otherCoin.txid}:0`]: 'shared' } });
  const screen = render(<SendDetails />);
  await waitFor(() => expect(screen.getByText(loc.send.legacy_replay_warning)).toBeTruthy());
  mockUiCheck.mockReturnValue({ checking: false, results: { [key]: 'shared', [`${otherCoin.txid}:0`]: 'absent' } });
  screen.rerender(<SendDetails />);
  expect(screen.queryByText(loc.send.legacy_replay_warning)).toBeNull();
});

it('checks every Coin Control output, including frozen coins, and labels each result', async () => {
  mockUiCheck.mockReturnValue({ checking: false, results: { [key]: 'shared', [`${otherCoin.txid}:0`]: 'unknown' } });
  mockStorage.txMetadata = {};
  const screen = render(<CoinControl />);
  await waitFor(() => expect(screen.getByText(loc.cc.legacy_shared)).toBeTruthy());
  expect(screen.getByText(loc.cc.legacy_unknown)).toBeTruthy();
  expect(screen.getByTestId('FrozenBadge')).toBeTruthy();
  expect(mockUiCheck).toHaveBeenCalledWith(expect.arrayContaining([coin, otherCoin]), expect.any(String));
});
