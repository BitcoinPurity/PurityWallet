import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import SendDetails from '../../screen/send/SendDetails';
import { LegacyWallet } from '../../class/wallets/legacy-wallet';
import { BitcoinUnit } from '../../models/bitcoinUnits';
import NetworkTransactionFees, { NetworkTransactionFee } from '../../models/networkTransactionFees';
import { createEllipsisHeaderMenuOptions } from '../../components/headerMenuOptions';
import { CommonToolTipActions } from '../../typings/CommonToolTipActions';
import type { SendDetailsParams } from '../../navigation/SendDetailsStackParamList';

const mockNavigation = { setParams: jest.fn(), setOptions: jest.fn(), navigate: jest.fn(), goBack: jest.fn() };
const mockRoute: { params: SendDetailsParams } = { params: { walletID: '', isEditable: true } };
jest.mock('react-native-image-picker', () => ({ launchCamera: jest.fn(), launchImageLibrary: jest.fn() }));
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useLocale: () => ({ direction: 'ltr' }),
  useFocusEffect: jest.fn(),
}));

const mockStorage = { wallets: [] as LegacyWallet[], txMetadata: {}, saveToDisk: jest.fn(), sleep: jest.fn() };
jest.mock('../../hooks/context/useStorage', () => ({ useStorage: () => mockStorage }));
jest.mock('../../hooks/useKeyboard', () => ({ useKeyboard: () => ({ isVisible: false }) }));
jest.mock('../../components/headerMenuOptions', () => ({
  createEllipsisHeaderMenuOptions: jest.fn(() => ({ headerRight: () => null, unstable_headerRightItems: () => [] })),
}));
jest.mock('../../components/AddressInput', () => 'View');
jest.mock('../../components/AmountInput', () => ({ AmountInput: 'View' }));
jest.mock('../../components/Avatar', () => 'View');
jest.mock('../../components/Icon', () => 'View');
jest.mock('../../components/BlueText', () => 'Text');
jest.mock('../../components/SafeArea', () => 'View');
jest.mock('../../components/DismissKeyboardInputAccessory', () => ({ DismissKeyboardInputAccessory: () => null }));
jest.mock('../../components/InputAccessoryAllFunds', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/Alert', () => jest.fn());
jest.mock('../../screen/ActionSheet', () => jest.fn());
jest.mock('../../components/themes', () => ({
  useTheme: () => ({ colors: { mainColor: '#1677ff', buttonTextColor: '#fff', lightButton: '#eee', buttonAlternativeTextColor: '#111' } }),
}));
jest.mock('../../loc', () => ({
  __esModule: true,
  default: {
    ...require('../../loc/en.json'),
    formatString: (text: string, values: Record<string, unknown>) =>
      Object.entries(values).reduce((result, [key, value]) => result.replace(`{${key}}`, String(value)), text),
  },
  formatBalance: (value: number) => String(value),
  formatBalanceWithoutSuffix: (value: number) => String(value),
}));

beforeEach(() => {
  jest.clearAllMocks();
  const first = new LegacyWallet();
  first.setSecret('first-wallet');
  first.setLabel('First wallet');
  const second = new LegacyWallet();
  second.setSecret('second-wallet');
  second.setLabel('Second wallet');
  for (const wallet of [first, second]) jest.spyOn(wallet, 'fetchUtxo').mockResolvedValue(undefined);
  mockStorage.wallets = [first, second];
  mockRoute.params = { walletID: first.getID(), isEditable: true };
  jest.spyOn(NetworkTransactionFees, 'recommendedFees').mockResolvedValue(new NetworkTransactionFee(3, 2, 1));
});
afterEach(() => jest.restoreAllMocks());

async function renderSendDetails() {
  const screen = render(<SendDetails />);
  await act(async () => {
    await Promise.resolve();
  });
  return screen;
}

describe('Send Coin Control entry', () => {
  it('opens Coin Control from a visible button even when the wallet balance is zero', async () => {
    const screen = await renderSendDetails();
    await waitFor(() => expect(screen.getByTestId('CoinControlButton')).toBeEnabled());
    fireEvent.press(screen.getByTestId('CoinControlButton'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CoinControl', { walletID: mockStorage.wallets[0].getID() });
    expect(screen.getByText('Coin Control')).toBeTruthy();
    expect(screen.getByTestId('CreateTransactionButton')).toBeTruthy();
  });

  it('removes Coin Control from the ellipsis menu while preserving other actions', async () => {
    await renderSendDetails();
    await waitFor(() => expect(createEllipsisHeaderMenuOptions).toHaveBeenCalled());
    const calls = jest.mocked(createEllipsisHeaderMenuOptions).mock.calls;
    const { actions } = calls[calls.length - 1][0];
    const entries = actions.flat();
    expect(entries.some(action => action.id === CommonToolTipActions.CoinControl.id)).toBe(false);
    expect(entries.some(action => action.id === CommonToolTipActions.AddRecipient.id)).toBe(true);
  });

  it('preserves pre-selected coins and their existing summary shortcut', async () => {
    const selected = [{ txid: '11'.repeat(32), vout: 0, value: 100000, isCoinbase: false }];
    mockRoute.params.utxos = selected;
    const screen = await renderSendDetails();
    await waitFor(() => expect(screen.getByTestId('CoinControlButton')).toBeEnabled());
    expect(screen.getByText('Coins Selected (1)')).toBeTruthy();
    expect(mockNavigation.setParams.mock.calls.every(([params]) => !('utxos' in params))).toBe(true);
    fireEvent.press(screen.getByText('Coins Selected (1)'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('CoinControl', { walletID: mockStorage.wallets[0].getID() });
    expect(mockRoute.params.utxos).toBe(selected);
  });

  it('uses the newly selected wallet when the Send wallet changes', async () => {
    const screen = await renderSendDetails();
    await screen.findByText('First wallet');
    mockRoute.params = { walletID: mockStorage.wallets[1].getID(), isEditable: true, amountUnit: BitcoinUnit.BTC };
    screen.rerender(<SendDetails />);
    await act(async () => {
      await Promise.resolve();
    });
    await screen.findByText('Second wallet');
    fireEvent.press(screen.getByTestId('CoinControlButton'));
    expect(mockNavigation.navigate).toHaveBeenLastCalledWith('CoinControl', { walletID: mockStorage.wallets[1].getID() });
  });
});
