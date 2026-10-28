import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import CoinControl from '../../screen/send/CoinControl';
import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import type { Utxo } from '../../class/wallets/types';

jest.mock('../../blue_modules/BlueElectrum', () => ({
  getSpendabilityTip: jest.fn(),
  getSpendabilityHeight: jest.fn(),
}));

jest.mock('../../hooks/useLegacyUtxoCheck', () => ({
  useLegacyUtxoCheck: () => ({ checking: false, results: { ['11'.repeat(32) + ':0']: 'shared' } }),
}));

const mockNavigation = { setParams: jest.fn(), navigate: jest.fn() };
const mockRoute = { params: { walletID: 'wallet', hasUtxos: true } };
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  useFocusEffect: jest.fn(),
}));

jest.mock('../../components/Avatar', () => 'View');
jest.mock('../../components/Icon', () => 'View');
jest.mock('../../components/SafeArea', () => 'View');
jest.mock('../../components/SafeAreaScrollView', () => 'View');
jest.mock('../../components/FloatButtons', () => ({ FButton: 'View', FContainer: 'View' }));
jest.mock('../../blue_modules/debounce', () => ({ __esModule: true, default: () => jest.fn() }));
jest.mock('../../components/themes', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../loc', () => ({
  __esModule: true,
  default: {
    cc: require('../../loc/en.json').cc,
    formatString: (text: string) => text,
  },
  formatBalance: (value: number) => String(value),
}));

const mockWallet = {
  getID: () => 'wallet',
  getUtxo: jest.fn(),
  fetchUtxo: jest.fn().mockResolvedValue(undefined),
  getUTXOMetadata: jest.fn(),
  getPreferredBalanceUnit: () => 'BTC',
  addressIsChange: jest.fn(),
};
const mockStorage = {
  wallets: [mockWallet],
  txMetadata: {},
  saveToDisk: jest.fn(),
  sleep: () => new Promise(() => {}),
};
jest.mock('../../hooks/context/useStorage', () => ({ useStorage: () => mockStorage }));

let output: Utxo;
beforeEach(() => {
  jest.clearAllMocks();
  output = { txid: '11'.repeat(32), vout: 0, value: 100000, address: 'address', height: 1, isCoinbase: true };
  mockWallet.getUtxo.mockImplementation(() => [output]);
  mockWallet.getUTXOMetadata.mockReturnValue({});
  mockWallet.addressIsChange.mockReturnValue(false);
  jest.mocked(BlueElectrum.getSpendabilityTip).mockReturnValue(1000);
  jest.mocked(BlueElectrum.getSpendabilityHeight).mockReturnValue(902);
});

describe('Coin Control immature Coinbase badge', () => {
  it.each([
    { name: '99 confirmations', isCoinbase: true, tip: 1000, height: 902, immature: true },
    { name: '100 confirmations', isCoinbase: true, tip: 1000, height: 901, immature: false },
    { name: '101 confirmations', isCoinbase: true, tip: 1000, height: 900, immature: false },
    { name: 'ordinary output', isCoinbase: false, tip: 1000, height: 1000, immature: false },
    { name: 'ordinary unconfirmed output', isCoinbase: false, tip: 1000, height: 0, immature: false },
    { name: 'unknown classification', isCoinbase: undefined, tip: 1000, height: 902, immature: false },
    { name: 'unavailable or stale tip', isCoinbase: true, tip: null, height: 902, immature: false },
    { name: 'unverified height', isCoinbase: true, tip: 1000, height: undefined, immature: false },
    { name: 'invalid height', isCoinbase: true, tip: 1000, height: -1, immature: false },
  ])('$name', async ({ isCoinbase, tip, height, immature }) => {
    output.isCoinbase = isCoinbase;
    jest.mocked(BlueElectrum.getSpendabilityTip).mockReturnValue(tip);
    jest.mocked(BlueElectrum.getSpendabilityHeight).mockReturnValue(height);
    const screen = render(<CoinControl />);
    await waitFor(() => expect(screen.queryByTestId('Loading')).toBeNull());
    expect(screen.queryAllByTestId('ImmatureBadge')).toHaveLength(immature ? 1 : 0);
    expect(screen.getByText('100000')).toBeTruthy();
  });

  it('shows a localized badge alongside the existing frozen and change badges', async () => {
    mockWallet.getUTXOMetadata.mockReturnValue({ frozen: true });
    mockWallet.addressIsChange.mockReturnValue(true);
    const screen = render(<CoinControl />);
    await waitFor(() => expect(screen.queryByTestId('Loading')).toBeNull());
    expect(screen.getByText('Immature')).toBeTruthy();
    expect(screen.getByTestId('FrozenBadge')).toBeTruthy();
    expect(screen.getByTestId('ChangeBadge')).toBeTruthy();
    expect(screen.getByRole('alert').props.children).toBe(require('../../loc/en.json').cc.legacy_shared);
    expect(require('../../loc/zh_cn.json').cc.immature).toBe('未成熟');
    expect(require('../../loc/zh_tw.json').cc.immature).toBe('未成熟');
  });

  it('removes the badge at maturity and restores it after rollback on re-render', async () => {
    const screen = render(<CoinControl />);
    await waitFor(() => expect(screen.queryByTestId('Loading')).toBeNull());
    expect(screen.getByTestId('ImmatureBadge')).toBeTruthy();
    jest.mocked(BlueElectrum.getSpendabilityHeight).mockReturnValue(901);
    screen.rerender(<CoinControl />);
    expect(screen.queryByTestId('ImmatureBadge')).toBeNull();
    jest.mocked(BlueElectrum.getSpendabilityTip).mockReturnValue(999);
    screen.rerender(<CoinControl />);
    expect(screen.getByTestId('ImmatureBadge')).toBeTruthy();
  });
});
